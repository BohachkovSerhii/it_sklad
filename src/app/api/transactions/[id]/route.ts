export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        asset: true,
        fromEmployee: true,
        toEmployee: true,
      }
    })
    
    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
