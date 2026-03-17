export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        asset: true,
        fromEmployee: true,
        toEmployee: true,
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { assetId, fromEmployeeId, toEmployeeId, type } = body

    if (!assetId || !type) {
      return NextResponse.json({ error: 'Asset ID and Type are required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        assetId: parseInt(assetId),
        fromEmployeeId: fromEmployeeId ? parseInt(fromEmployeeId) : undefined,
        toEmployeeId: toEmployeeId ? parseInt(toEmployeeId) : undefined,
        type,
      },
    })

    // Optionally update the Asset employeeId based on the transaction
    if (type === 'Видача' && toEmployeeId) {
      await prisma.asset.update({
        where: { id: parseInt(assetId) },
        data: { employeeId: parseInt(toEmployeeId) }
      })
    } else if (type === 'Повернення') {
      await prisma.asset.update({
        where: { id: parseInt(assetId) },
        data: { employeeId: null }
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
