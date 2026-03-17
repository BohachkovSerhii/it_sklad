export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
      }
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, departmentId, position, email } = body

    if (!fullName || !departmentId) {
      return NextResponse.json({ error: 'Full Name and Department ID are required' }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: { 
        fullName, 
        departmentId: parseInt(departmentId), 
        position, 
        email 
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
