export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const department = await prisma.department.findUnique({
      where: { id },
    })
    
    if (!department) return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const body = await request.json()
    const { name } = body

    const department = await prisma.department.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    await prisma.department.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}
