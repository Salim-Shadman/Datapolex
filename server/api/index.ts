// server/api/index.ts
// এটি Vercel Serverless Function এর এন্ট্রি পয়েন্ট হিসেবে কাজ করবে

// মূল Express অ্যাপটি src/server থেকে ইমপোর্ট করা হলো
import app from '../src/server';

// Vercel-এর জন্য Express অ্যাপটিকে default হিসেবে এক্সপোর্ট করা আবশ্যক
// Vercel এই এক্সপোর্ট করা অ্যাপটিকে একটি Serverless Function এ র্যাপ করবে
export default app;