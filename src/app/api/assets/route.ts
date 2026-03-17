export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        employee: true,
        location: true,
      }
    })
    return NextResponse.json(assets)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, model, inventoryNumber, categoryId, 
      status, serialNumber, employeeId, locationId 
    } = body

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and Category ID are required' }, { status: 400 })
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        model,
        inventoryNumber,
        categoryId: parseInt(categoryId),
        status: status || 'Active',
        serialNumber,
        employeeId: employeeId ? parseInt(employeeId) : undefined,
        locationId: locationId ? parseInt(locationId) : undefined,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
