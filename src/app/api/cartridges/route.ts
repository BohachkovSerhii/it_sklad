export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cartridges = await prisma.cartridge.findMany()
    return NextResponse.json(cartridges)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cartridges' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { modelName, barcode, printerCompatibility, countNew, countEmpty, countRefilling } = body

    if (!modelName) {
      return NextResponse.json({ error: 'Model Name is required' }, { status: 400 })
    }

    const cartridge = await prisma.cartridge.create({
      data: {
        modelName,
        barcode: barcode || null,
        printerCompatibility,
        countNew: parseInt(countNew) || 0,
        countEmpty: parseInt(countEmpty) || 0,
        countRefilling: parseInt(countRefilling) || 0,
      },
    })

    return NextResponse.json(cartridge, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cartridge' }, { status: 500 })
  }
}
