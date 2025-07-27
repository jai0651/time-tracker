import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /teams - List teams for the organization
router.get('/', auth, async (req, res) => {
  try {
    const organizationId = req.user.organizationId || 'default-org';
    
    // Get unique teams from employees in the organization
    const teams = await prisma.employee.findMany({
      where: { organizationId },
      select: { teamId: true },
      distinct: ['teamId']
    });
    
    // Get team counts
    const teamCounts = await prisma.employee.groupBy({
      by: ['teamId'],
      where: { organizationId },
      _count: { id: true }
    });
    
    // Combine the data
    const teamData = teams.map(team => {
      const count = teamCounts.find(tc => tc.teamId === team.teamId)?._count?.id || 0;
      return {
        id: team.teamId,
        name: team.teamId,
        memberCount: count
      };
    });
    
    res.json(teamData);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/suggestions - Get team suggestions for autocomplete
router.get('/suggestions', auth, async (req, res) => {
  try {
    // const organizationId = req.user.organizationId || 'default-org';
    
    // // Get all unique team IDs from the organization
    // const teams = await prisma.employee.findMany({
    //   where: { organizationId },
    //   select: { teamId: true },
    //   distinct: ['teamId']
    // });
    
    // const teamIds = teams.map(team => team.teamId);
    
    // Add some common team suggestions
    const commonTeams = [
      'Engineering',
      'Design',
      'Product',
      'Marketing',
      'Sales',
      'Support',
      'Operations',
      'HR',
      'Finance',
      'Legal'
    ];
    
    // Combine existing teams with common suggestions, removing duplicates
    const allTeams = [...new Set([...commonTeams])];
    
    res.json(allTeams);
  } catch (error) {
    console.error('Error fetching team suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 