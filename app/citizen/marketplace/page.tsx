'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { CheckCircle2, ChevronRight, Store, Sparkles, Upload, X } from 'lucide-react';

const categories = [
  { id: 'paper', name: 'Paper', price: '₹8/kg', desc: 'Newspapers, books, office paper, magazines' },
  { id: 'plastic', name: 'Plastic', price: '₹12/kg', desc: 'PET bottles, containers, clean packaging' },
  { id: 'metal', name: 'Metal', price: '₹45/kg', desc: 'Aluminium cans, steel, copper wiring, brass' },
  { id: 'ewaste', name: 'E-Waste', price: '₹100/kg', desc: 'Old phones, chargers, laptops, circuit boards' },
  { id: 'cardboard', name: 'Cardboard', price: '₹6/kg', desc: 'Carton boxes, packaging cards, brown sheets' },
];

export default function ScrapMarketplacePage() {
  const router = useRouter();
  const [category, setCategory] = useState(categories[0].id);
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('4, Karve Road, Ward 03 – Kothrud, Indore');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !address) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setWeight('');
    setCategory(categories[0].id);
    setAddress('4, Karve Road, Ward 03 – Kothrud, Indore');
    removePhoto();
    setIsSubmitted(false);
  };

  return (
    <>
      <SiteHeader
        title="Scrap Marketplace"
        actionLabel="File Complaint"
        onAction={() => router.push('/citizen/file-complaint')}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6 max-w-5xl mx-auto w-full">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Store className="size-8 text-primary" />
              Scrap Marketplace
            </h1>
            <p className="text-muted-foreground text-base">
              Turn your household recyclables and segregated scrap waste into reward points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Cards (Left 2 columns) */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="font-semibold text-lg flex items-center gap-1.5">
                  <Sparkles className="size-4.5 text-yellow-500 fill-yellow-500" />
                  Estimated Scrap Valuation
                </h2>
                <span className="text-xs text-muted-foreground">Prices subject to market conditions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((c) => (
                  <Card key={c.id} className="bg-gradient-to-br from-card to-muted/20 border transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-semibold">{c.name}</CardTitle>
                        <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{c.price}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">{c.desc}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* List Scrap Form (Right 1 column) */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg border-b pb-2">Request Scrap Pickup</h2>
              
              {!isSubmitted ? (
                <Card className="border">
                  <CardContent className="pt-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="scrap-category" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Select Scrap Category
                        </label>
                        <select
                          id="scrap-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="scrap-weight" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Estimated Weight (kg)
                        </label>
                        <Input
                          id="scrap-weight"
                          type="number"
                          placeholder="e.g. 5"
                          min="1"
                          required
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="scrap-address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Pickup Address
                        </label>
                        <Input
                          id="scrap-address"
                          type="text"
                          placeholder="Enter your address"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="scrap-photo" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                          Upload Photo (Optional)
                        </label>
                        <div className="flex items-center gap-4">
                          <label
                            htmlFor="scrap-photo"
                            className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors w-full h-20 border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              <Upload className="size-5 mb-1" />
                              <span className="text-[10px] font-semibold">Select Image</span>
                            </div>
                            <input
                              id="scrap-photo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoChange}
                            />
                          </label>
                        </div>
                        {photoPreview && (
                          <div className="relative mt-2 size-20 rounded-lg overflow-hidden border">
                            <img src={photoPreview} alt="Preview" className="size-full object-cover" />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full flex items-center justify-center gap-1">
                        Request Pickup
                        <ChevronRight className="size-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="pt-8 text-center space-y-4">
                    <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-bold text-emerald-500">Pickup Requested!</CardTitle>
                      <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                        A verified dealer in your ward has been alerted. They will contact you shortly to coordinate the pickup and point transfer.
                      </p>
                    </div>
                    <Button onClick={handleReset} variant="outline" size="sm" className="mt-2 text-xs">
                      Submit Another
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
