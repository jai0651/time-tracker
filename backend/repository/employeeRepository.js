import { prisma } from '../prisma/prismaClient.js';
import crypto from 'crypto';


export async function findEmployeeByEmail(email) {
  return prisma.employee.findUnique({ where: { email } });
}

export async function listEmployees() {
  return prisma.employee.findMany({
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      tasks: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function findEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      projects: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      tasks: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

// export async function createEmployee(data,finalSharedSettingsId) {
//   await prisma.employee.create({
//     data: {
//       name,
//       email,
//       teamId,
//       sharedSettingsId: finalSharedSettingsId,
//       organizationId,
//       invited: new Date()
//     },
//     include: {
//       projects: {
//         select: {
//           id: true,
//           name: true,
//           description: true
//         }
//       },
//       tasks: {
//         select: {
//           id: true,
//           name: true,
//           description: true,
//           status: true,
//           priority: true,
//           project: {
//             select: {
//               id: true,
//               name: true
//             }
//           }
//         }
//       }
//     }
//   });
// }

export async function updateEmployeeName(id, name) {
  return prisma.employee.update({
    where: { id },
    data: { name }
  });
}

export async function deactivateEmployee(id) {
  // First check if employee has any project or task associations
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      projects: {
        select: { id: true, name: true }
      },
      tasks: {
        select: { id: true, name: true }
      }
    }
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check for project associations
  if (employee.projects && employee.projects.length > 0) {
    const projectNames = employee.projects.map(p => p.name).join(', ');
    throw new Error(`Cannot deactivate employee. They are still assigned to projects: ${projectNames}`);
  }

  // Check for task associations
  if (employee.tasks && employee.tasks.length > 0) {
    const taskNames = employee.tasks.map(t => t.name).join(', ');
    throw new Error(`Cannot deactivate employee. They are still assigned to tasks: ${taskNames}`);
  }

  // If no associations, proceed with deactivation
  return prisma.employee.update({
    where: { id },
    data: { 
      status: 'inactive',
      hashedPassword: null,
      activationToken: null
    }
  });
} 