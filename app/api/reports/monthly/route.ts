import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { complaintService, wardService, violationService, workerService } from '@/services/appwrite/client';
import { getServerTrackingEngine } from '@/services/tracking/server-tracker';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export const maxDuration = 60; // Allow enough time for complex report generation

export async function POST(req: NextRequest) {
  try {
    // 1. Verify credentials (Admin check)
    const userId = req.headers.get('x-user-id');
    const userType = req.headers.get('x-user-type');

    if (userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    // 2. Fetch live data across all services
    const [complaintsRes, wards, violationsRes, workersRes, trackingEngine] = await Promise.all([
      complaintService.list({}, 1, 200),
      wardService.list(),
      violationService.list(1, 200),
      workerService.list(1, 100),
      getServerTrackingEngine(),
    ]);

    const complaints = complaintsRes.data;
    const violations = violationsRes.data;
    const workers = workersRes.data;
    const vehicles = trackingEngine.getVehicles();

    // 3. Select AI Model
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    let aiModel: any;

    if (geminiKey) {
      const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });
      aiModel = googleProvider('gemini-2.5-flash');
    } else {
      const { google } = require('@ai-sdk/google');
      aiModel = google('gemini-2.5-flash');
    }

    // 4. Generate structured prompt containing all city/fleet metrics
    const reportData = {
      timestamp: new Date().toISOString(),
      city: 'Indore',
      wards: wards.map((w) => ({
        code: w.code,
        name: w.name,
        cleanlinessScore: w.cleanlinessScore,
        activeComplaints: w.complaintCount,
        population: w.population,
        area: w.area,
      })),
      fleet: vehicles.map((v) => ({
        reg: v.registrationNumber,
        status: v.status,
        efficiency: v.efficiency,
        isDeviated: v.isDeviated,
        ward: v.currentRoute.wardName,
        wardCode: v.currentRoute.wardCode,
      })),
      complaints: {
        total: complaintsRes.total,
        status: {
          OPEN: complaints.filter(c => c.status === 'OPEN').length,
          ASSIGNED: complaints.filter(c => c.status === 'ASSIGNED').length,
          IN_PROGRESS: complaints.filter(c => c.status === 'IN_PROGRESS').length,
          RESOLVED: complaints.filter(c => c.status === 'RESOLVED').length,
          ESCALATED: complaints.filter(c => c.status === 'ESCALATED').length,
        },
        categories: complaints.reduce((acc: any, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1;
          return acc;
        }, {}),
      },
      violations: {
        total: violationsRes.total,
        open: violations.filter(v => v.status === 'OPEN').length,
      },
      workers: {
        total: workers.length,
        averageCompletionRate: Math.round(workers.reduce((sum, w) => sum + w.completionRate, 0) / workers.length),
        lowPerformingCount: workers.filter(w => w.completionRate < 85).length,
      }
    };

    const prompt = `
You are the Chief Sanitation Commissioner's Senior Data Analyst for the WasteFlow smart waste management platform.
Your task is to generate a comprehensive, high-fidelity Monthly City Sanitation & Fleet Audit Report for the city of Indore based on the provided live data.

Data Source Snapshot:
${JSON.stringify(reportData, null, 2)}

Requirements for the generated report:
1. **Professional Format**: Format in clean, beautiful Markdown. Use proper heading hierarchies (# for title, ## for main sections). Use tables and bullet lists extensively for readability.
2. **Key Sections**:
   - # WasteFlow Smart Sanitation System: Monthly Report Analysis (Indore)
   - ## 1. Executive Summary: Summary of the city's cleanliness, average cleanliness score, and key alerts.
   - ## 2. Fleet Compliance & Routing Audit: Table summarizing the fleet vehicles, highlighting active routes, average fleet efficiency, and vehicles currently flagged with deviation alerts.
   - ## 3. Ward-by-Ward Cleanliness & Violation Analysis: Compare cleanliness scores, identify the top performing and lowest performing wards, and analyze municipal violations.
   - ## 4. Citizen Complaints & Resolutions: Breakdown of complaints by category and status, noting speed of resolution.
   - ## 5. Actionable Recommendations: Concrete steps the municipal corporation should take (e.g. re-assigning workers to low-performing wards, auditing deviated vehicles).
3. **No Placeholders**: Write full sentences, detail-rich analyses, and actual calculations based on the provided data.
`;

    // 5. Execute Gemini Text Generation
    const { text } = await generateText({
      model: aiModel,
      prompt,
    });

    // 6. Convert Markdown to PDF
    const { mdToPdf } = require('md-to-pdf');

    // Resolve chrome executable path dynamically
    let chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(chromePath)) {
      chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    }

    const pdf = await mdToPdf(
      { content: text },
      {
        launch_options: {
          executablePath: chromePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        pdf_options: {
          format: 'A4',
          margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
          printBackground: true,
        },
        css: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            color: #1e3a8a;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
            margin-top: 30px;
          }
          h2 {
            color: #2563eb;
            margin-top: 25px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
        `,
      }
    ).catch((err: any) => {
      console.error('PDF Generation failed:', err);
      return null;
    });

    if (!pdf) {
      return NextResponse.json(
        { error: 'Failed to convert report to PDF. Please ensure Chrome/Edge is installed on the host system.' },
        { status: 500 }
      );
    }

    return new NextResponse(pdf.content, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=indore-monthly-sanitation-report-${new Date().toISOString().split('T')[0]}.pdf`,
      },
    });
  } catch (error) {
    console.error('Monthly Report Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
