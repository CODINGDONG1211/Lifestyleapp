export interface Exercise {
  name: string;
  category: string;
  subcategory?: string;
}

export const exercises: Exercise[] = [
  // Full Body / Compound Exercises
  { name: "Deadlifts", category: "Full Body", subcategory: "Compound" },
  { name: "Squats", category: "Full Body", subcategory: "Compound" },
  { name: "Clean and Press", category: "Full Body", subcategory: "Compound" },
  { name: "Snatch", category: "Full Body", subcategory: "Compound" },
  { name: "Kettlebell Swings", category: "Full Body", subcategory: "Compound" },
  { name: "Thrusters", category: "Full Body", subcategory: "Compound" },
  { name: "Burpees", category: "Full Body", subcategory: "Compound" },

  // Upper Body - Chest
  { name: "Bench Press", category: "Upper Body", subcategory: "Chest" },
  { name: "Incline Bench Press", category: "Upper Body", subcategory: "Chest" },
  { name: "Decline Bench Press", category: "Upper Body", subcategory: "Chest" },
  { name: "Chest Flyes", category: "Upper Body", subcategory: "Chest" },
  { name: "Push-Ups", category: "Upper Body", subcategory: "Chest" },
  { name: "Chest Press Machine", category: "Upper Body", subcategory: "Chest" },

  // Upper Body - Back
  { name: "Pull-Ups", category: "Upper Body", subcategory: "Back" },
  { name: "Chin-Ups", category: "Upper Body", subcategory: "Back" },
  { name: "Lat Pulldown", category: "Upper Body", subcategory: "Back" },
  { name: "Barbell Rows", category: "Upper Body", subcategory: "Back" },
  { name: "Dumbbell Rows", category: "Upper Body", subcategory: "Back" },
  { name: "T-Bar Rows", category: "Upper Body", subcategory: "Back" },
  { name: "Seated Cable Row", category: "Upper Body", subcategory: "Back" },

  // Upper Body - Shoulders
  { name: "Overhead Press", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Arnold Press", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Lateral Raises", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Front Raises", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Rear Delt Flyes", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Shrugs", category: "Upper Body", subcategory: "Shoulders" },
  { name: "Upright Rows", category: "Upper Body", subcategory: "Shoulders" },

  // Upper Body - Biceps
  { name: "Barbell Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "Dumbbell Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "Hammer Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "Preacher Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "Concentration Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "Cable Curls", category: "Upper Body", subcategory: "Biceps" },
  { name: "EZ Bar Curls", category: "Upper Body", subcategory: "Biceps" },

  // Upper Body - Triceps
  { name: "Tricep Dips", category: "Upper Body", subcategory: "Triceps" },
  { name: "Skull Crushers", category: "Upper Body", subcategory: "Triceps" },
  { name: "Tricep Pushdowns", category: "Upper Body", subcategory: "Triceps" },
  { name: "Overhead Tricep Extensions", category: "Upper Body", subcategory: "Triceps" },
  { name: "Close-Grip Bench Press", category: "Upper Body", subcategory: "Triceps" },
  { name: "Tricep Kickbacks", category: "Upper Body", subcategory: "Triceps" },

  // Lower Body - Quadriceps
  { name: "Back Squats", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Front Squats", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Goblet Squats", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Leg Press", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Lunges", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Step-Ups", category: "Lower Body", subcategory: "Quadriceps" },
  { name: "Bulgarian Split Squats", category: "Lower Body", subcategory: "Quadriceps" },

  // Lower Body - Hamstrings
  { name: "Romanian Deadlifts", category: "Lower Body", subcategory: "Hamstrings" },
  { name: "Leg Curls", category: "Lower Body", subcategory: "Hamstrings" },
  { name: "Good Mornings", category: "Lower Body", subcategory: "Hamstrings" },
  { name: "Glute-Ham Raise", category: "Lower Body", subcategory: "Hamstrings" },

  // Lower Body - Glutes
  { name: "Hip Thrusts", category: "Lower Body", subcategory: "Glutes" },
  { name: "Glute Bridges", category: "Lower Body", subcategory: "Glutes" },
  { name: "Cable Kickbacks", category: "Lower Body", subcategory: "Glutes" },

  // Lower Body - Calves
  { name: "Standing Calf Raises", category: "Lower Body", subcategory: "Calves" },
  { name: "Seated Calf Raises", category: "Lower Body", subcategory: "Calves" },
  { name: "Donkey Calf Raises", category: "Lower Body", subcategory: "Calves" },
  { name: "Calf Press", category: "Lower Body", subcategory: "Calves" },

  // Core / Abs
  { name: "Plank", category: "Core", subcategory: "Abs" },
  { name: "Side Plank", category: "Core", subcategory: "Abs" },
  { name: "Crunches", category: "Core", subcategory: "Abs" },
  { name: "Sit-Ups", category: "Core", subcategory: "Abs" },
  { name: "Russian Twists", category: "Core", subcategory: "Abs" },
  { name: "Hanging Leg Raises", category: "Core", subcategory: "Abs" },
  { name: "Knee Tucks", category: "Core", subcategory: "Abs" },
  { name: "Ab Rollouts", category: "Core", subcategory: "Abs" },
  { name: "Bicycle Crunches", category: "Core", subcategory: "Abs" },
  { name: "Cable Woodchoppers", category: "Core", subcategory: "Abs" },
  { name: "Decline Bench Sit-Ups", category: "Core", subcategory: "Abs" },
  { name: "Mountain Climbers", category: "Core", subcategory: "Abs" },

  // Mobility & Flexibility
  { name: "Foam Rolling", category: "Mobility", subcategory: "Recovery" },
  { name: "Dynamic Stretching", category: "Mobility", subcategory: "Flexibility" },
  { name: "Static Stretching", category: "Mobility", subcategory: "Flexibility" },
  { name: "Resistance Band Work", category: "Mobility", subcategory: "Flexibility" },
  { name: "Single-Leg Balance Work", category: "Mobility", subcategory: "Balance" },

  // Cardio
  { name: "Treadmill Running", category: "Cardio" },
  { name: "Treadmill Walking", category: "Cardio" },
  { name: "Stationary Bike", category: "Cardio" },
  { name: "Rowing Machine", category: "Cardio" },
  { name: "Elliptical", category: "Cardio" },
  { name: "Stair Climber", category: "Cardio" },
  { name: "Jump Rope", category: "Cardio" },
  { name: "Battle Ropes", category: "Cardio" },
  { name: "Sled Pushes", category: "Cardio" },
  { name: "HIIT Circuits", category: "Cardio" }
]; 