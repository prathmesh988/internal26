import { Client } from "node-appwrite";

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a54010f001e2cdc301d")
    .setKey("standard_7602ad1d99ade1b70c8abe153ac3864721d45fbcc79dfa84ed3517da6b048fd46534b45243cc2ac4f7625be113c6c1f2224693cac3540c9eb977fed3e6fe10520f9c85e0ea68161e3e083358d3bd924ac91b41279b47e57c694755dd8c8c37889396466653298b2abf2ac9686fed40957560f26909af02b2f19eb32af2d20bf0");

export { client };
