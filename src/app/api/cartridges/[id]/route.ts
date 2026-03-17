export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const cartridge = await prisma.cartridge.findUnique({
      where: { id }
    })
    
    if (!cartridge) return NextResponse.json({ error: 'Cartridge not found' }, { status: 404 })
    
    return NextResponse.json(cartridge)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cartridge' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const body = await request.json()
    const { modelName, barcode, printerCompatibility, countNew, countEmpty, countRefilling } = body

    const cartridge = await prisma.cartridge.update({
      where: { id },
      data: {
        modelName,
        barcode: barcode !== undefined ? (barcode || null) : undefined,
        printerCompatibility,
        countNew: countNew !== undefined ? parseInt(countNew) : undefined,
        countEmpty: countEmpty !== undefined ? parseInt(countEmpty) : undefined,
        countRefilling: countRefilling !== undefined ? parseInt(countRefilling) : undefined,
      },
    })

    return NextResponse.json(cartridge)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cartridge' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    await prisma.cartridge.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cartridge' }, { status: 500 })
  }
}
