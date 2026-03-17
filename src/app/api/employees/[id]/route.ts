export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
      }
    })
    
    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    const body = await request.json()
    const { fullName, departmentId, position, email } = body

    const employee = await prisma.employee.update({
      where: { id },
      data: { 
        fullName, 
        departmentId: departmentId ? parseInt(departmentId) : undefined, 
        position, 
        email 
      },
    })

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    await prisma.employee.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
