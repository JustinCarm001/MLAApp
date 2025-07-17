// Arena Positioning System for Hockey Live App
// Automatically determines optimal camera positions based on arena type

export const ARENA_CONFIGURATIONS = {
  standard: {
    rink_length: 200, // feet
    rink_width: 85,   // feet
    goal_line_distance: 11,
    center_ice_x: 100,
    center_ice_y: 42.5,
    optimal_positions: {
      goal_line_1: { x: 11, y: 42.5, angle: 0, priority: 1 },
      goal_line_2: { x: 189, y: 42.5, angle: 180, priority: 1 },
      center_ice: { x: 100, y: 85, angle: 270, priority: 2 },
      bench_side: { x: 100, y: 0, angle: 90, priority: 3 },
      corner_cam_1: { x: 25, y: 65, angle: 315, priority: 4 },
      corner_cam_2: { x: 175, y: 20, angle: 135, priority: 4 }
    }
  },
  olympic: {
    rink_length: 197, // feet
    rink_width: 98.4, // feet
    goal_line_distance: 13,
    center_ice_x: 98.5,
    center_ice_y: 49.2,
    optimal_positions: {
      goal_line_1: { x: 13, y: 49.2, angle: 0, priority: 1 },
      goal_line_2: { x: 184, y: 49.2, angle: 180, priority: 1 },
      center_ice: { x: 98.5, y: 98.4, angle: 270, priority: 2 },
      bench_side: { x: 98.5, y: 0, angle: 90, priority: 3 },
      corner_cam_1: { x: 30, y: 75, angle: 315, priority: 4 },
      corner_cam_2: { x: 167, y: 23, angle: 135, priority: 4 }
    }
  },
  junior: {
    rink_length: 185, // feet
    rink_width: 85,   // feet
    goal_line_distance: 10,
    center_ice_x: 92.5,
    center_ice_y: 42.5,
    optimal_positions: {
      goal_line_1: { x: 10, y: 42.5, angle: 0, priority: 1 },
      goal_line_2: { x: 175, y: 42.5, angle: 180, priority: 1 },
      center_ice: { x: 92.5, y: 85, angle: 270, priority: 2 },
      bench_side: { x: 92.5, y: 0, angle: 90, priority: 3 },
      corner_cam_1: { x: 23, y: 65, angle: 315, priority: 4 },
      corner_cam_2: { x: 162, y: 20, angle: 135, priority: 4 }
    }
  }
};

// Arena Positioning Algorithm
export class ArenaPositioningSystem {
  constructor(arenaType = 'standard') {
    this.arenaType = arenaType;
    this.configuration = ARENA_CONFIGURATIONS[arenaType];
    this.assignedPositions = new Map();
  }

  // Main function to assign camera positions to parents
  assignCameraPositions(parentIds) {
    /*
    FUNCTION assignCameraPositions(parentIds):
        VALIDATE parent count (2-6 parents)
        LOAD arena configuration
        SORT positions by priority
        ASSIGN positions to parents based on priority
        GENERATE positioning instructions
        RETURN assignment with visual guidance
    */
    
    if (parentIds.length < 2 || parentIds.length > 6) {
      throw new Error('Invalid number of parents. Must be between 2-6.');
    }

    // Clear previous assignments
    this.assignedPositions.clear();

    // Get positions sorted by priority
    const sortedPositions = this.getSortedPositions();
    
    // Assign positions to parents
    for (let i = 0; i < parentIds.length; i++) {
      const parentId = parentIds[i];
      const position = sortedPositions[i];
      
      this.assignedPositions.set(parentId, {
        position_name: position.name,
        coordinates: position.data,
        instructions: this.generateInstructions(position.name, position.data),
        setup_guidance: this.getSetupGuidance(position.name)
      });
    }

    return this.assignedPositions;
  }

  // Get positions sorted by priority for optimal coverage
  getSortedPositions() {
    /*
    FUNCTION getSortedPositions():
        EXTRACT all positions from arena configuration
        SORT by priority (1 = highest priority)
        RETURN ordered list of positions
    */
    
    const positions = [];
    const config = this.configuration.optimal_positions;
    
    for (const [name, data] of Object.entries(config)) {
      positions.push({ name, data });
    }
    
    // Sort by priority (lower number = higher priority)
    return positions.sort((a, b) => a.data.priority - b.data.priority);
  }

  // Generate human-readable instructions for camera positioning
  generateInstructions(positionName, positionData) {
    /*
    FUNCTION generateInstructions(positionName, positionData):
        SWITCH on position name
        GENERATE specific setup instructions
        INCLUDE safety and angle guidance
        RETURN formatted instructions
    */
    
    const instructions = {
      goal_line_1: {
        title: "Goal Line Camera 1",
        description: "Position behind the goal line, centered",
        setup: [
          "Stand directly behind the goal line",
          "Center yourself with the goal posts",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture entire goal area and crease",
          "Keep phone steady - this is a priority angle"
        ],
        safety: "Stay behind the glass and away from player benches"
      },
      goal_line_2: {
        title: "Goal Line Camera 2",
        description: "Position behind the opposite goal line, centered",
        setup: [
          "Stand directly behind the opposite goal line",
          "Center yourself with the goal posts",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture entire goal area and crease",
          "Keep phone steady - this is a priority angle"
        ],
        safety: "Stay behind the glass and away from player benches"
      },
      center_ice: {
        title: "Center Ice Camera",
        description: "Position at center ice, elevated view",
        setup: [
          "Position yourself at center ice along the boards",
          "Find an elevated position if possible (stands)",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture center ice and both zones",
          "Follow the puck movement across the ice"
        ],
        safety: "Ensure clear view without blocking other spectators"
      },
      bench_side: {
        title: "Bench Side Camera",
        description: "Position opposite the player benches",
        setup: [
          "Position yourself opposite the player benches",
          "Find a stable position against the boards",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture bench-side action",
          "Focus on line changes and bench activity"
        ],
        safety: "Stay clear of penalty box and official areas"
      },
      corner_cam_1: {
        title: "Corner Camera 1",
        description: "Position in corner for wide-angle coverage",
        setup: [
          "Position yourself in the corner seating area",
          "Find an elevated position for better angle",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture corner plays and boards",
          "Good for power play coverage"
        ],
        safety: "Ensure stable footing and clear sightlines"
      },
      corner_cam_2: {
        title: "Corner Camera 2",
        description: "Position in opposite corner for coverage",
        setup: [
          "Position yourself in the opposite corner",
          "Find an elevated position for better angle",
          "Hold phone horizontally in landscape mode",
          "Aim camera to capture corner plays and boards",
          "Good for defensive zone coverage"
        ],
        safety: "Ensure stable footing and clear sightlines"
      }
    };

    return instructions[positionName] || {
      title: "Standard Position",
      description: "Standard camera position",
      setup: ["Position phone horizontally", "Keep steady aim", "Follow the action"],
      safety: "Stay in designated spectator areas"
    };
  }

  // Get setup guidance with visual aids
  getSetupGuidance(positionName) {
    /*
    FUNCTION getSetupGuidance(positionName):
        GENERATE visual guidance for camera setup
        INCLUDE optimal height, angle, and zoom settings
        RETURN setup parameters
    */
    
    return {
      camera_height: "Chest level or higher",
      orientation: "Landscape (horizontal)",
      zoom_level: "Wide angle to capture maximum action",
      focus_mode: "Auto-focus with tracking",
      stability: "Use both hands or tripod if available",
      frame_rate: "60fps for smooth motion capture"
    };
  }

  // Calculate optimal camera settings based on position
  getOptimalCameraSettings(positionName) {
    /*
    FUNCTION getOptimalCameraSettings(positionName):
        CALCULATE optimal camera settings for position
        CONSIDER lighting, distance, and coverage area
        RETURN camera configuration
    */
    
    const baseSettings = {
      resolution: "1080p",
      frame_rate: 60,
      focus_mode: "continuous",
      exposure: "auto",
      stabilization: true
    };

    // Position-specific adjustments
    const positionAdjustments = {
      goal_line_1: { zoom: 1.2, focus_area: "goal_crease" },
      goal_line_2: { zoom: 1.2, focus_area: "goal_crease" },
      center_ice: { zoom: 0.8, focus_area: "full_ice" },
      bench_side: { zoom: 1.0, focus_area: "bench_area" },
      corner_cam_1: { zoom: 1.0, focus_area: "corner_play" },
      corner_cam_2: { zoom: 1.0, focus_area: "corner_play" }
    };

    return {
      ...baseSettings,
      ...positionAdjustments[positionName]
    };
  }

  // Validate camera position assignment
  validateAssignment() {
    /*
    FUNCTION validateAssignment():
        CHECK if all critical positions are covered
        ENSURE no overlapping assignments
        VALIDATE minimum coverage requirements
        RETURN validation results
    */
    
    const criticalPositions = ['goal_line_1', 'goal_line_2'];
    const assignedPositionNames = Array.from(this.assignedPositions.values())
      .map(assignment => assignment.position_name);

    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check for critical positions
    criticalPositions.forEach(position => {
      if (!assignedPositionNames.includes(position)) {
        validation.valid = false;
        validation.errors.push(`Critical position ${position} not assigned`);
      }
    });

    // Check for center ice coverage with 3+ cameras
    if (assignedPositionNames.length >= 3 && !assignedPositionNames.includes('center_ice')) {
      validation.warnings.push('Consider adding center ice camera for better coverage');
    }

    return validation;
  }
}

// Utility functions for arena positioning
export const ArenaUtils = {
  // Convert arena coordinates to real-world positioning
  coordinatesToPosition(x, y, arenaType) {
    const config = ARENA_CONFIGURATIONS[arenaType];
    return {
      distance_from_center: Math.sqrt(
        Math.pow(x - config.center_ice_x, 2) + 
        Math.pow(y - config.center_ice_y, 2)
      ),
      zone: this.determineZone(x, config),
      side: y > config.center_ice_y ? 'bench_side' : 'opposite_side'
    };
  },

  // Determine which zone the position is in
  determineZone(x, config) {
    if (x < config.rink_length * 0.33) return 'defensive_zone';
    if (x > config.rink_length * 0.67) return 'offensive_zone';
    return 'neutral_zone';
  },

  // Calculate coverage overlap between positions
  calculateCoverageOverlap(position1, position2) {
    const distance = Math.sqrt(
      Math.pow(position1.x - position2.x, 2) + 
      Math.pow(position1.y - position2.y, 2)
    );
    
    // Estimate overlap based on distance and angles
    const angleDiff = Math.abs(position1.angle - position2.angle);
    const overlapScore = Math.max(0, 100 - (distance / 10) - (angleDiff / 10));
    
    return Math.min(overlapScore, 100);
  }
};