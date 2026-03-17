export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        employee: true,
        location: true,
      }
    })
    
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    
    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const body = await request.json()
    const { 
      name, model, inventoryNumber, categoryId, 
      status, serialNumber, employeeId, locationId 
    } = body

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        model,
        inventoryNumber,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        status,
        serialNumber,
        employeeId: employeeId ? parseInt(employeeId) : null,
        locationId: locationId ? parseInt(locationId) : null,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
