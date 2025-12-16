// server/index.ts
// এটি Vercel Serverless Function এর নতুন এন্ট্রি পয়েন্ট

// মূল Express অ্যাপটি src/server থেকে ইমপোর্ট করা হলো
import app from './src/server'; 

// Vercel-এর জন্য Express অ্যাপটিকে default হিসেবে এক্সপোর্ট করা আবশ্যক
export default app;