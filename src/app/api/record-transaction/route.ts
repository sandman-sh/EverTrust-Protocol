import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { txHash } = await req.json();

    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
      return NextResponse.json({ success: false, error: 'Invalid transaction hash' }, { status: 400 });
    }

    interface Strk20Manifest {
      transactions: string[];
      contracts: string[];
      demo_video: string;
      demo_url: string;
    }

    const strk20Path = path.join(process.cwd(), 'strk20.json');
    let strk20Data: Strk20Manifest = { transactions: [], contracts: [], demo_video: '', demo_url: '' };

    try {
      const fileContent = await fs.readFile(strk20Path, 'utf-8');
      strk20Data = JSON.parse(fileContent);
    } catch {
      // file will be created if not found
    }

    if (!Array.isArray(strk20Data.transactions)) {
      strk20Data.transactions = [];
    }

    if (!strk20Data.transactions.includes(txHash)) {
      strk20Data.transactions.push(txHash);
      await fs.writeFile(strk20Path, JSON.stringify(strk20Data, null, 2), 'utf-8');
    }

    return NextResponse.json({
      success: true,
      transactions: strk20Data.transactions,
    });
  } catch (error: any) {
    console.error('Error updating strk20.json:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
