/**
 * Awards - Badge and milestone tracking
 */

import { get_date_string } from "./utils.js"

// Award definitions
const AWARD_DEFINITIONS = [
	// Getting Started
	{
		id: "first_entry",
		title: "First Steps",
		description: "Log your first walking entry",
		icon: "👶",
		check: (entry) => entry.steps >= 1
	},
	{
		id: "steps_500",
		title: "Tiny Steps",
		description: "Walk 500 steps in a single day",
		icon: "👣",
		check: (entry) => entry.steps >= 500
	},
	{
		id: "steps_1k",
		title: "1,000 Steps",
		description: "Walk 1,000 steps in a single day",
		icon: "👣",
		check: (entry) => entry.steps >= 1000
	},
	{
		id: "steps_2k",
		title: "Double Grand",
		description: "Walk 2,000 steps in a single day",
		icon: "🐾",
		check: (entry) => entry.steps >= 2000
	},
	{
		id: "steps_2500",
		title: "2,500 Steps",
		description: "Walk 2,500 steps in a single day",
		icon: "🐾",
		check: (entry) => entry.steps >= 2500
	},
	{
		id: "steps_5k",
		title: "5,000 Steps",
		description: "Walk 5,000 steps in a single day",
		icon: "🚶",
		check: (entry) => entry.steps >= 5000
	},
	{
		id: "steps_7500",
		title: "7,500 Steps",
		description: "Walk 7,500 steps in a single day",
		icon: "🚶‍♂️",
		check: (entry) => entry.steps >= 7500
	},
	{
		id: "steps_10k",
		title: "10,000 Steps",
		description: "Walk 10,000 steps in a single day",
		icon: "🏃",
		check: (entry) => entry.steps >= 10000
	},
	{
		id: "steps_12500",
		title: "12,500 Steps",
		description: "Walk 12,500 steps in a single day",
		icon: "🏃‍♂️",
		check: (entry) => entry.steps >= 12500
	},
	{
		id: "steps_15k",
		title: "15,000 Steps",
		description: "Walk 15,000 steps in a single day",
		icon: "⚡",
		check: (entry) => entry.steps >= 15000
	},
	{
		id: "steps_20k",
		title: "20,000 Steps",
		description: "Walk 20,000 steps in a single day",
		icon: "🔥",
		check: (entry) => entry.steps >= 20000
	},
	{
		id: "steps_25k",
		title: "25,000 Steps",
		description: "Walk 25,000 steps in a single day",
		icon: "💪",
		check: (entry) => entry.steps >= 25000
	},
	{
		id: "steps_30k",
		title: "30,000 Steps",
		description: "Walk 30,000 steps in a single day",
		icon: "🦸",
		check: (entry) => entry.steps >= 30000
	},
	{
		id: "steps_50k",
		title: "Ultra Walker",
		description: "Walk 50,000 steps in a single day",
		icon: "🌟",
		check: (entry) => entry.steps >= 50000
	},

	// Distance milestones
	{
		id: "distance_500m",
		title: "Half-K",
		description: "Walk 0.5 kilometers in a single day",
		icon: "📍",
		check: (entry) => entry.distance_km >= 0.5
	},
	{
		id: "distance_1km",
		title: "1 Kilometer",
		description: "Walk 1 kilometer in a single day",
		icon: "📌",
		check: (entry) => entry.distance_km >= 1
	},
	{
		id: "distance_2km",
		title: "2 Kilometers",
		description: "Walk 2 kilometers in a single day",
		icon: "🚩",
		check: (entry) => entry.distance_km >= 2
	},
	{
		id: "distance_3km",
		title: "3 Kilometers",
		description: "Walk 3 kilometers in a single day",
		icon: "🏁",
		check: (entry) => entry.distance_km >= 3
	},
	{
		id: "distance_5km",
		title: "5 Kilometers",
		description: "Walk 5 kilometers in a single day",
		icon: "📍",
		check: (entry) => entry.distance_km >= 5
	},
	{
		id: "distance_10km",
		title: "10 Kilometers",
		description: "Walk 10 kilometers in a single day",
		icon: "🗺️",
		check: (entry) => entry.distance_km >= 10
	},
	{
		id: "distance_15km",
		title: "15 Kilometers",
		description: "Walk 15 kilometers in a single day",
		icon: "🧭",
		check: (entry) => entry.distance_km >= 15
	},
	{
		id: "distance_half_marathon",
		title: "Half Marathon",
		description: "Walk 21.1 kilometers in a single day",
		icon: "🏅",
		check: (entry) => entry.distance_km >= 21.1
	},
	{
		id: "distance_marathon",
		title: "Marathon",
		description: "Walk 42.2 kilometers in a single day",
		icon: "🎖️",
		check: (entry) => entry.distance_km >= 42.2
	},

	// Time milestones
	{
		id: "time_5min",
		title: "Quick Break",
		description: "Walk for 5 minutes in a single day",
		icon: "⏱️",
		check: (entry) => entry.time_minutes >= 5
	},
	{
		id: "time_10min",
		title: "10 Minute Walk",
		description: "Walk for 10 minutes in a single day",
		icon: "⏳",
		check: (entry) => entry.time_minutes >= 10
	},
	{
		id: "time_15min",
		title: "15 Minute Walk",
		description: "Walk for 15 minutes in a single day",
		icon: "⌛",
		check: (entry) => entry.time_minutes >= 15
	},
	{
		id: "time_30min",
		title: "30 Minute Walk",
		description: "Walk for 30 minutes in a single day",
		icon: "⏱️",
		check: (entry) => entry.time_minutes >= 30
	},
	{
		id: "time_45min",
		title: "45 Minute Walk",
		description: "Walk for 45 minutes in a single day",
		icon: "⏲️",
		check: (entry) => entry.time_minutes >= 45
	},
	{
		id: "time_1hr",
		title: "1 Hour Walk",
		description: "Walk for 60 minutes in a single day",
		icon: "🕐",
		check: (entry) => entry.time_minutes >= 60
	},
	{
		id: "time_90min",
		title: "90 Minute Walk",
		description: "Walk for 90 minutes in a single day",
		icon: "🕜",
		check: (entry) => entry.time_minutes >= 90
	},
	{
		id: "time_2hr",
		title: "2 Hour Walk",
		description: "Walk for 120 minutes in a single day",
		icon: "⏰",
		check: (entry) => entry.time_minutes >= 120
	},
	{
		id: "time_3hr",
		title: "3 Hour Walk",
		description: "Walk for 180 minutes in a single day",
		icon: "🕰️",
		check: (entry) => entry.time_minutes >= 180
	},

	// Calorie milestones
	{
		id: "calories_25",
		title: "Spark",
		description: "Burn 25 calories in a single day",
		icon: "✨",
		check: (entry) => entry.calories >= 25
	},
	{
		id: "calories_50",
		title: "50 Calorie Burn",
		description: "Burn 50 calories in a single day",
		icon: "✨",
		check: (entry) => entry.calories >= 50
	},
	{
		id: "calories_100",
		title: "100 Calorie Burn",
		description: "Burn 100 calories in a single day",
		icon: "🔋",
		check: (entry) => entry.calories >= 100
	},
	{
		id: "calories_150",
		title: "150 Calorie Burn",
		description: "Burn 150 calories in a single day",
		icon: "🔌",
		check: (entry) => entry.calories >= 150
	},
	{
		id: "calories_200",
		title: "200 Calorie Burn",
		description: "Burn 200 calories in a single day",
		icon: "💡",
		check: (entry) => entry.calories >= 200
	},
	{
		id: "calories_300",
		title: "300 Calorie Burn",
		description: "Burn 300 calories in a single day",
		icon: "⚡",
		check: (entry) => entry.calories >= 300
	},
	{
		id: "calories_500",
		title: "500 Calorie Burn",
		description: "Burn 500 calories in a single day",
		icon: "🔥",
		check: (entry) => entry.calories >= 500
	},
	{
		id: "calories_750",
		title: "750 Calorie Burn",
		description: "Burn 750 calories in a single day",
		icon: "🌋",
		check: (entry) => entry.calories >= 750
	},
	{
		id: "calories_1000",
		title: "1000 Calorie Burn",
		description: "Burn 1000 calories in a single day",
		icon: "💥",
		check: (entry) => entry.calories >= 1000
	},

	// Step variety awards
	{
		id: "steps_3k",
		title: "3,000 Steps",
		description: "Walk 3,000 steps in a single day",
		icon: "🌱",
		check: (entry) => entry.steps >= 3000
	},
	{
		id: "steps_4k",
		title: "4,000 Steps",
		description: "Walk 4,000 steps in a single day",
		icon: "🌿",
		check: (entry) => entry.steps >= 4000
	},
	{
		id: "steps_6k",
		title: "6,000 Steps",
		description: "Walk 6,000 steps in a single day",
		icon: "🌲",
		check: (entry) => entry.steps >= 6000
	},
	{
		id: "steps_8k",
		title: "8,000 Steps",
		description: "Walk 8,000 steps in a single day",
		icon: "🌳",
		check: (entry) => entry.steps >= 8000
	},
	{
		id: "steps_40k",
		title: "40,000 Steps",
		description: "Walk 40,000 steps in a single day",
		icon: "🦅",
		check: (entry) => entry.steps >= 40000
	},

	// More distance milestones
	{
		id: "distance_4km",
		title: "4 Kilometers",
		description: "Walk 4 kilometers in a single day",
		icon: "🛤️",
		check: (entry) => entry.distance_km >= 4
	},
	{
		id: "distance_6km",
		title: "6 Kilometers",
		description: "Walk 6 kilometers in a single day",
		icon: "🛣️",
		check: (entry) => entry.distance_km >= 6
	},
	{
		id: "distance_7km",
		title: "7 Kilometers",
		description: "Walk 7 kilometers in a single day",
		icon: "🌄",
		check: (entry) => entry.distance_km >= 7
	},
	{
		id: "distance_8km",
		title: "8 Kilometers",
		description: "Walk 8 kilometers in a single day",
		icon: "⛰️",
		check: (entry) => entry.distance_km >= 8
	},
	{
		id: "distance_20km",
		title: "20 Kilometers",
		description: "Walk 20 kilometers in a single day",
		icon: "🏔️",
		check: (entry) => entry.distance_km >= 20
	},
	{
		id: "distance_25km",
		title: "25 Kilometers",
		description: "Walk 25 kilometers in a single day",
		icon: "🗻",
		check: (entry) => entry.distance_km >= 25
	},
	{
		id: "distance_30km",
		title: "30 Kilometers",
		description: "Walk 30 kilometers in a single day",
		icon: "🌍",
		check: (entry) => entry.distance_km >= 30
	},

	// More time milestones
	{
		id: "time_20min",
		title: "20 Minute Walk",
		description: "Walk for 20 minutes in a single day",
		icon: "🎯",
		check: (entry) => entry.time_minutes >= 20
	},
	{
		id: "time_4hr",
		title: "4 Hour Walk",
		description: "Walk for 4 hours in a single day",
		icon: "🌅",
		check: (entry) => entry.time_minutes >= 240
	},
	{
		id: "time_5hr",
		title: "5 Hour Walk",
		description: "Walk for 5 hours in a single day",
		icon: "🌄",
		check: (entry) => entry.time_minutes >= 300
	},
	{
		id: "time_6hr",
		title: "6 Hour Walk",
		description: "Walk for 6 hours in a single day",
		icon: "🌠",
		check: (entry) => entry.time_minutes >= 360
	},
	{
		id: "time_8hr",
		title: "8 Hour Walk",
		description: "Walk for 8 hours in a single day - a full workday!",
		icon: "🌌",
		check: (entry) => entry.time_minutes >= 480
	},

	// Fun themed awards
	{
		id: "perfect_10k",
		title: "Perfect 10K",
		description: "Walk exactly 10,000 steps in a day (within 100)",
		icon: "🎯",
		check: (entry) => entry.steps >= 9950 && entry.steps <= 10050
	},
	{
		id: "nice_steps",
		title: "Nice!",
		description: "Walk exactly 6,969 steps in a day",
		icon: "😏",
		check: (entry) => entry.steps >= 6969 && entry.steps <= 6999
	},
	{
		id: "round_number",
		title: "Round Number",
		description: "Walk exactly 5,000 or 10,000 or 15,000 or 20,000 steps",
		icon: "🔵",
		check: (entry) => [5000, 10000, 15000, 20000].includes(Math.round(entry.steps / 100) * 100)
	},
	{
		id: "lucky_7",
		title: "Lucky 7",
		description: "Walk at least 7,777 steps in a day",
		icon: "🍀",
		check: (entry) => entry.steps >= 7777
	},
	{
		id: "short_walk",
		title: "Quick Stroll",
		description: "Log any walk under 5 minutes",
		icon: "🚶‍♀️",
		check: (entry) => entry.time_minutes > 0 && entry.time_minutes < 5
	},

	// More fun themed awards
	{
		id: "double_goal",
		title: "Double Trouble",
		description: "Walk double your daily goal (20,000+ steps)",
		icon: "✌️",
		check: (entry) => entry.steps >= 20000
	},
	{
		id: "steady_pace",
		title: "Steady Pace",
		description: "Walk between 80-120 steps per minute",
		icon: "🎵",
		check: (entry) => entry.time_minutes > 0 && (entry.steps / entry.time_minutes) >= 80 && (entry.steps / entry.time_minutes) <= 120
	},
	{
		id: "morning_person",
		title: "Morning Walker",
		description: "Log 5,000+ steps in a single entry",
		icon: "🌅",
		check: (entry) => entry.steps >= 5000
	},
	{
		id: "consistent_steps",
		title: "Consistent",
		description: "Log exactly between 9,000-11,000 steps",
		icon: "📊",
		check: (entry) => entry.steps >= 9000 && entry.steps <= 11000
	},
	{
		id: "balanced_walk",
		title: "Balanced",
		description: "Walk where distance (km) roughly matches time (min/10)",
		icon: "⚖️",
		check: (entry) => entry.time_minutes > 0 && Math.abs(entry.distance_km - (entry.time_minutes / 10)) < 1
	},

	// Milestone variety
	{
		id: "steps_9k",
		title: "9,000 Steps",
		description: "Walk 9,000 steps in a single day",
		icon: "9️⃣",
		check: (entry) => entry.steps >= 9000
	},
	{
		id: "steps_11k",
		title: "11,000 Steps",
		description: "Walk 11,000 steps in a single day",
		icon: "🎰",
		check: (entry) => entry.steps >= 11000
	},
	{
		id: "steps_13k",
		title: "13,000 Steps",
		description: "Walk 13,000 steps in a single day",
		icon: "🔮",
		check: (entry) => entry.steps >= 13000
	},
	{
		id: "steps_17500",
		title: "17,500 Steps",
		description: "Walk 17,500 steps in a single day",
		icon: "🎯",
		check: (entry) => entry.steps >= 17500
	},
	{
		id: "steps_22500",
		title: "22,500 Steps",
		description: "Walk 22,500 steps in a single day",
		icon: "🎳",
		check: (entry) => entry.steps >= 22500
	},

	// Calorie variety
	{
		id: "calories_175",
		title: "175 Calorie Burn",
		description: "Burn 175 calories in a single day",
		icon: "💛",
		check: (entry) => entry.calories >= 175
	},
	{
		id: "calories_225",
		title: "225 Calorie Burn",
		description: "Burn 225 calories in a single day",
		icon: "🧡",
		check: (entry) => entry.calories >= 225
	},
	{
		id: "calories_350",
		title: "350 Calorie Burn",
		description: "Burn 350 calories in a single day",
		icon: "❤️",
		check: (entry) => entry.calories >= 350
	},
	{
		id: "calories_400",
		title: "400 Calorie Burn",
		description: "Burn 400 calories in a single day",
		icon: "💜",
		check: (entry) => entry.calories >= 400
	},
	{
		id: "calories_600",
		title: "600 Calorie Burn",
		description: "Burn 600 calories in a single day",
		icon: "💙",
		check: (entry) => entry.calories >= 600
	},

	// Time variety
	{
		id: "time_25min",
		title: "25 Minute Walk",
		description: "Walk for 25 minutes in a single day",
		icon: "⌚",
		check: (entry) => entry.time_minutes >= 25
	},
	{
		id: "time_35min",
		title: "35 Minute Walk",
		description: "Walk for 35 minutes in a single day",
		icon: "🕐",
		check: (entry) => entry.time_minutes >= 35
	},
	{
		id: "time_50min",
		title: "50 Minute Walk",
		description: "Walk for 50 minutes in a single day",
		icon: "🕑",
		check: (entry) => entry.time_minutes >= 50
	},
	{
		id: "time_75min",
		title: "75 Minute Walk",
		description: "Walk for 75 minutes in a single day",
		icon: "🕒",
		check: (entry) => entry.time_minutes >= 75
	},
	{
		id: "time_100min",
		title: "100 Minute Walk",
		description: "Walk for 100 minutes in a single day",
		icon: "💯",
		check: (entry) => entry.time_minutes >= 100
	},

	// Distance variety
	{
		id: "distance_9km",
		title: "9 Kilometers",
		description: "Walk 9 kilometers in a single day",
		icon: "🛤️",
		check: (entry) => entry.distance_km >= 9
	},
	{
		id: "distance_11km",
		title: "11 Kilometers",
		description: "Walk 11 kilometers in a single day",
		icon: "🛣️",
		check: (entry) => entry.distance_km >= 11
	},
	{
		id: "distance_13km",
		title: "13 Kilometers",
		description: "Walk 13 kilometers in a single day",
		icon: "🎪",
		check: (entry) => entry.distance_km >= 13
	},
	{
		id: "distance_14km",
		title: "14 Kilometers",
		description: "Walk 14 kilometers in a single day",
		icon: "🎡",
		check: (entry) => entry.distance_km >= 14
	},
	{
		id: "distance_16km",
		title: "16 Kilometers",
		description: "Walk 16 kilometers in a single day",
		icon: "🎢",
		check: (entry) => entry.distance_km >= 16
	},
	{
		id: "distance_17km",
		title: "17 Kilometers",
		description: "Walk 17 kilometers in a single day",
		icon: "🎠",
		check: (entry) => entry.distance_km >= 17
	},
	{
		id: "distance_18km",
		title: "18 Kilometers",
		description: "Walk 18 kilometers in a single day",
		icon: "🏖️",
		check: (entry) => entry.distance_km >= 18
	},
	// Fun & Lifestyle Awards
	{
		id: "weekend_warrior",
		title: "Weekend Warrior",
		description: "Log 10,000+ steps on a Saturday or Sunday",
		icon: "🎉",
		check: (entry, settings) => {
			if (settings && settings.include_weekends === false) {
				return false
			}

			const date = new Date(entry.date + "T00:00:00")
			const day = date.getDay()

			return (day === 0 || day === 6) && entry.steps >= 10000
		}
	},
	{
		id: "palindrome_steps",
		title: "Palindrome",
		description: "Log a palindromic step count > 1000 (e.g. 1221, 5665)",
		icon: "🔁",
		check: (entry) => {
			const s = String(entry.steps)

			return entry.steps > 1000 && s === s.split("").reverse().join("")
		}
	},
	{
		id: "triplet_steps",
		title: "Triple Threat",
		description: "Log a step count with 3 repeated digits at the end (e.g. 5777)",
		icon: "🎰",
		check: (entry) => entry.steps > 1000 && /(\d)\1\1$/.test(String(entry.steps))
	},
	{
		id: "step_pi",
		title: "Pi Walker",
		description: "Walk 3,141 steps (approx pi * 1000)",
		icon: "🥧",
		check: (entry) => entry.steps >= 3140 && entry.steps <= 3145
	},
	{
		id: "binary_walker",
		title: "Binary Beast",
		description: "Steps composed only of 1s and 0s (e.g. 10110)",
		icon: "🤖",
		check: (entry) => entry.steps > 100 && /^[01]+$/.test(String(entry.steps))
	},
	{
		id: "the_answer",
		title: "The Answer",
		description: "Walk exactly 42 or 4,200 or 42,000 steps",
		icon: "🌌",
		check: (entry) => [42, 4200, 42000].includes(entry.steps)
	},
	{
		id: "stairs_equivalent",
		title: "Sky High",
		description: "Distance equivalent to climbing the Burj Khalifa (~830m)",
		icon: "🏙️",
		check: (entry) => entry.distance_km >= 0.83
	},
	{
		id: "lunch_break",
		title: "Lunch Break",
		description: "A solid 15-30 minute walk",
		icon: "🥪",
		check: (entry) => entry.time_minutes >= 15 && entry.time_minutes <= 30
	},
	{
		id: "movie_length",
		title: "Feature Film",
		description: "Walk for the duration of a movie (90+ mins)",
		icon: "🎬",
		check: (entry) => entry.time_minutes >= 90
	}
]

// Cumulative awards (totals over time)
const CUMULATIVE_AWARDS = [
	// Cumulative Steps
	{
		id: "total_steps_2500",
		title: "Warm Up",
		description: "Reach 2,500 total steps",
		icon: "👟",
		type: "steps",
		threshold: 2500
	},
	{
		id: "total_steps_5k",
		title: "Getting Serious",
		description: "Reach 5,000 total steps",
		icon: "👞",
		type: "steps",
		threshold: 5000
	},
	{
		id: "total_steps_7500",
		title: "7.5K Steps",
		description: "Reach 7,500 total steps",
		icon: "👟",
		type: "steps",
		threshold: 7500
	},
	{
		id: "total_steps_10k",
		title: "The First 10K",
		description: "Reach 10,000 total steps",
		icon: "🏆",
		type: "steps",
		threshold: 10000
	},
	{
		id: "total_steps_15k",
		title: "15K Steps",
		description: "Reach 15,000 total steps",
		icon: "🚶",
		type: "steps",
		threshold: 15000
	},
	{
		id: "total_steps_20k",
		title: "20K Steps",
		description: "Reach 20,000 total steps",
		icon: "🚶",
		type: "steps",
		threshold: 20000
	},
	{
		id: "total_steps_25k",
		title: "25K Steps",
		description: "Reach 25,000 total steps",
		icon: "🚶",
		type: "steps",
		threshold: 25000
	},
	{
		id: "total_steps_30k",
		title: "30K Steps",
		description: "Reach 30,000 total steps",
		icon: "🚶",
		type: "steps",
		threshold: 30000
	},
	{
		id: "total_steps_35k",
		title: "35K Steps",
		description: "Reach 35,000 total steps",
		icon: "🏃",
		type: "steps",
		threshold: 35000
	},
	{
		id: "total_steps_40k",
		title: "40K Steps",
		description: "Reach 40,000 total steps",
		icon: "🏃",
		type: "steps",
		threshold: 40000
	},
	{
		id: "total_steps_45k",
		title: "45K Steps",
		description: "Reach 45,000 total steps",
		icon: "🏃",
		type: "steps",
		threshold: 45000
	},
	{
		id: "total_steps_50k",
		title: "Step Jubilee",
		description: "Reach 50,000 total steps",
		icon: "🥈",
		type: "steps",
		threshold: 50000
	},
	{
		id: "total_steps_60k",
		title: "60K Steps",
		description: "Reach 60,000 total steps",
		icon: "🤟",
		type: "steps",
		threshold: 60000
	},
	{
		id: "total_steps_65k",
		title: "65K Steps",
		description: "Reach 65,000 total steps",
		icon: "🤟",
		type: "steps",
		threshold: 65000
	},
	{
		id: "total_steps_70k",
		title: "70K Steps",
		description: "Reach 70,000 total steps",
		icon: "🤟",
		type: "steps",
		threshold: 70000
	},
	{
		id: "total_steps_75k",
		title: "75K Steps",
		description: "Reach 75,000 total steps",
		icon: "👢",
		type: "steps",
		threshold: 75000
	},
	{
		id: "total_steps_80k",
		title: "80K Steps",
		description: "Reach 80,000 total steps",
		icon: "👢",
		type: "steps",
		threshold: 80000
	},
	{
		id: "total_steps_90k",
		title: "90K Steps",
		description: "Reach 90,000 total steps",
		icon: "👢",
		type: "steps",
		threshold: 90000
	},
	{
		id: "total_steps_95k",
		title: "95K Steps",
		description: "Reach 95,000 total steps",
		icon: "👢",
		type: "steps",
		threshold: 95000
	},
	{
		id: "total_steps_100k",
		title: "Century Walker",
		description: "Reach 100,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 100000
	},
	{
		id: "total_steps_125k",
		title: "125K Steps",
		description: "Reach 125,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 125000
	},
	{
		id: "total_steps_150k",
		title: "150K Steps",
		description: "Reach 150,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 150000
	},
	{
		id: "total_steps_175k",
		title: "175K Steps",
		description: "Reach 175,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 175000
	},
	{
		id: "total_steps_200k",
		title: "200K Steps",
		description: "Reach 200,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 200000
	},
	{
		id: "total_steps_225k",
		title: "225K Steps",
		description: "Reach 225,000 total steps",
		icon: "🥇",
		type: "steps",
		threshold: 225000
	},
	{
		id: "total_steps_250k",
		title: "Quarter Million",
		description: "Reach 250,000 total steps",
		icon: "💎",
		type: "steps",
		threshold: 250000
	},
	{
		id: "total_steps_300k",
		title: "300K Steps",
		description: "Reach 300,000 total steps",
		icon: "💎",
		type: "steps",
		threshold: 300000
	},
	{
		id: "total_steps_400k",
		title: "400K Steps",
		description: "Reach 400,000 total steps",
		icon: "💎",
		type: "steps",
		threshold: 400000
	},
	{
		id: "total_steps_500k",
		title: "Half Million Milestone",
		description: "Reach 500,000 total steps",
		icon: "👑",
		type: "steps",
		threshold: 500000
	},
	{
		id: "total_steps_600k",
		title: "600K Steps",
		description: "Reach 600,000 total steps",
		icon: "👑",
		type: "steps",
		threshold: 600000
	},
	{
		id: "total_steps_700k",
		title: "700K Steps",
		description: "Reach 700,000 total steps",
		icon: "👑",
		type: "steps",
		threshold: 700000
	},
	{
		id: "total_steps_800k",
		title: "800K Steps",
		description: "Reach 800,000 total steps",
		icon: "👑",
		type: "steps",
		threshold: 800000
	},
	{
		id: "total_steps_900k",
		title: "900K Steps",
		description: "Reach 900,000 total steps",
		icon: "👑",
		type: "steps",
		threshold: 900000
	},
	{
		id: "total_steps_1m",
		title: "Step Millionaire",
		description: "Reach 1,000,000 total steps!",
		icon: "🌌",
		type: "steps",
		threshold: 1000000
	},

	// Cumulative Distance
	{
		id: "total_distance_1km",
		title: "First Kilometer",
		description: "Reach 1 kilometer total walking distance",
		icon: "📏",
		type: "distance",
		threshold: 1
	},
	{
		id: "total_distance_5km",
		title: "5K Cumulative",
		description: "Reach 5 kilometers total walking distance",
		icon: "📐",
		type: "distance",
		threshold: 5
	},
	{
		id: "total_distance_7_5km",
		title: "7.5KM Stroll",
		description: "Reach 7.5 kilometers total walking distance",
		icon: "📏",
		type: "distance",
		threshold: 75
	},
	{
		id: "total_distance_10km",
		title: "10K Club",
		description: "Reach 10 kilometers total walking distance",
		icon: "📍",
		type: "distance",
		threshold: 10
	},
	{
		id: "total_distance_15km",
		title: "15KM Trek",
		description: "Reach 15 kilometers total walking distance",
		icon: "🧭",
		type: "distance",
		threshold: 15
	},
	{
		id: "total_distance_20km",
		title: "20K Trek",
		description: "Reach 20 kilometers total walking distance",
		icon: "🧭",
		type: "distance",
		threshold: 20
	},
	{
		id: "total_distance_25km",
		title: "25KM Trek",
		description: "Reach 25 kilometers total walking distance",
		icon: "🧭",
		type: "distance",
		threshold: 25
	},
	{
		id: "total_distance_30km",
		title: "30KM Trek",
		description: "Reach 30 kilometers total walking distance",
		icon: "🧭",
		type: "distance",
		threshold: 30
	},
	{
		id: "total_distance_35km",
		title: "35K Voyage",
		description: "Reach 35 kilometers total walking distance",
		icon: "🏔️",
		type: "distance",
		threshold: 35
	},
	{
		id: "total_distance_40km",
		title: "40KM Voyage",
		description: "Reach 40 kilometers total walking distance",
		icon: "🏔️",
		type: "distance",
		threshold: 40
	},
	{
		id: "total_distance_45km",
		title: "45KM Voyage",
		description: "Reach 45 kilometers total walking distance",
		icon: "🏔️",
		type: "distance",
		threshold: 45
	},
	{
		id: "total_distance_50km",
		title: "50K Trekker",
		description: "Reach 50 kilometers total walking distance",
		icon: "🗺️",
		type: "distance",
		threshold: 50
	},
	{
		id: "total_distance_55km",
		title: "55KM Trekker",
		description: "Reach 55 kilometers total walking distance",
		icon: "🗺️",
		type: "distance",
		threshold: 55
	},
	{
		id: "total_distance_60km",
		title: "60KM Trek",
		description: "Reach 60 kilometers total walking distance",
		icon: "🚧",
		type: "distance",
		threshold: 60
	},
	{
		id: "total_distance_65km",
		title: "65KM Trek",
		description: "Reach 65 kilometers total walking distance",
		icon: "🚧",
		type: "distance",
		threshold: 65
	},
	{
		id: "total_distance_70km",
		title: "70KM Trek",
		description: "Reach 70 kilometers total walking distance",
		icon: "🚧",
		type: "distance",
		threshold: 70
	},
	{
		id: "total_distance_75km",
		title: "75KM Journey",
		description: "Reach 75 kilometers total walking distance",
		icon: "⚓",
		type: "distance",
		threshold: 75
	},
	{
		id: "total_distance_80km",
		title: "80KM Journey",
		description: "Reach 80 kilometers total walking distance",
		icon: "⚓",
		type: "distance",
		threshold: 80
	},
	{
		id: "total_distance_90km",
		title: "90KM Journey",
		description: "Reach 90 kilometers total walking distance",
		icon: "⚓",
		type: "distance",
		threshold: 90
	},
	{
		id: "total_distance_95km",
		title: "95KM Journey",
		description: "Reach 95 kilometers total walking distance",
		icon: "⚓",
		type: "distance",
		threshold: 95
	},
	{
		id: "total_distance_100km",
		title: "The Hundredth KM",
		description: "Reach 100 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 100
	},
	{
		id: "total_distance_125km",
		title: "125KM Journey",
		description: "Reach 125 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 125
	},
	{
		id: "total_distance_150km",
		title: "150KM Journey",
		description: "Reach 150 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 150
	},
	{
		id: "total_distance_175km",
		title: "175KM Journey",
		description: "Reach 175 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 175
	},
	{
		id: "total_distance_200km",
		title: "200KM Journey",
		description: "Reach 200 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 200
	},
	{
		id: "total_distance_225km",
		title: "225KM Journey",
		description: "Reach 225 kilometers total walking distance",
		icon: "🌐",
		type: "distance",
		threshold: 225
	},
	{
		id: "total_distance_250km",
		title: "Cross-Country Casual",
		description: "Reach 250 kilometers total walking distance",
		icon: "🛤️",
		type: "distance",
		threshold: 250
	},
	{
		id: "total_distance_500km",
		title: "Road Warrior",
		description: "Reach 500 kilometers total walking distance",
		icon: "🛣️",
		type: "distance",
		threshold: 500
	},
	{
		id: "total_distance_1000km",
		title: "Grand Tour",
		description: "Reach 1,000 kilometers total walking distance",
		icon: "🌍",
		type: "distance",
		threshold: 1000
	},

	// Cumulative Calories
	{
		id: "total_calories_250",
		title: "First Burn",
		description: "Burn 250 total calories",
		icon: "🕯️",
		type: "calories",
		threshold: 250
	},
	{
		id: "total_calories_500",
		title: "Warming Up",
		description: "Burn 500 total calories",
		icon: "🔦",
		type: "calories",
		threshold: 500
	},
	{
		id: "total_calories_750",
		title: "750 Calorie Burn",
		description: "Burn 750 total calories",
		icon: "🕯️",
		type: "calories",
		threshold: 750
	},
	{
		id: "total_calories_1k",
		title: "Calorie Burn Beginner",
		description: "Burn 1,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 1000
	},
	{
		id: "total_calories_1500",
		title: "1,500 Calorie Burn",
		description: "Burn 1,500 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 1500
	},
	{
		id: "total_calories_2k",
		title: "2,000 Calorie Burn",
		description: "Burn 2,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 2000
	},
	{
		id: "total_calories_2500",
		title: "2,500 Calorie Burn",
		description: "Burn 2,500 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 2500
	},
	{
		id: "total_calories_3k",
		title: "3,000 Calorie Burn",
		description: "Burn 3,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 3000
	},
	{
		id: "total_calories_3500",
		title: "3,500 Calorie Burn",
		description: "Burn 3,500 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 3500
	},
	{
		id: "total_calories_4k",
		title: "4,000 Calorie Burn",
		description: "Burn 4,000 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 4000
	},
	{
		id: "total_calories_4500",
		title: "4,500 Calorie Burn",
		description: "Burn 4,500 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 4500
	},
	{
		id: "total_calories_5k",
		title: "Calorie Crusader",
		description: "Burn 5,000 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 5000
	},
	{
		id: "total_calories_6k",
		title: "6K Burner",
		description: "Burn 6,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 6000
	},
	{
		id: "total_calories_5500",
		title: "5,500 Calorie Burn",
		description: "Burn 5,500 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 5500
	},
	{
		id: "total_calories_6500",
		title: "6,500 Calorie Burn",
		description: "Burn 6,500 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 6500
	},
	{
		id: "total_calories_7k",
		title: "7,000 Calorie Burn",
		description: "Burn 7,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 7000
	},
	{
		id: "total_calories_7500",
		title: "7,500 Calorie Burn",
		description: "Burn 7,500 total calories",
		icon: "🌋",
		type: "calories",
		threshold: 7500
	},
	{
		id: "total_calories_8k",
		title: "8,000 Calorie Burn",
		description: "Burn 8,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 8000
	},
	{
		id: "total_calories_9k",
		title: "9,000 Calorie Burn",
		description: "Burn 9,000 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 9000
	},
	{
		id: "total_calories_9500",
		title: "9,500 Calorie Burn",
		description: "Burn 9,500 total calories",
		icon: "🔥",
		type: "calories",
		threshold: 9500
	},
	{
		id: "total_calories_10k",
		title: "Energy Elite",
		description: "Burn 10,000 total calories",
		icon: "💥",
		type: "calories",
		threshold: 10000
	},
	{
		id: "total_calories_12500",
		title: "12,500 Calorie Burn",
		description: "Burn 12,500 total calories",
		icon: "💥",
		type: "calories",
		threshold: 12500
	},
	{
		id: "total_calories_15k",
		title: "15,000 Calorie Burn",
		description: "Burn 15,000 total calories",
		icon: "💥",
		type: "calories",
		threshold: 15000
	},
	{
		id: "total_calories_17500",
		title: "17,500 Calorie Burn",
		description: "Burn 17,500 total calories",
		icon: "💥",
		type: "calories",
		threshold: 17500
	},
	{
		id: "total_calories_20k",
		title: "20,000 Calorie Burn",
		description: "Burn 20,000 total calories",
		icon: "💥",
		type: "calories",
		threshold: 20000
	},
	{
		id: "total_calories_22500",
		title: "22,500 Calorie Burn",
		description: "Burn 22,500 total calories",
		icon: "💥",
		type: "calories",
		threshold: 22500
	},
	{
		id: "total_calories_25k",
		title: "Thermic Titan",
		description: "Burn 25,000 total calories",
		icon: "☄️",
		type: "calories",
		threshold: 25000
	},
	{
		id: "total_calories_30k",
		title: "30,000 Calorie Burn",
		description: "Burn 30,000 total calories",
		icon: "☄️",
		type: "calories",
		threshold: 30000
	},
	{
		id: "total_calories_40k",
		title: "40,000 Calorie Burn",
		description: "Burn 40,000 total calories",
		icon: "☄️",
		type: "calories",
		threshold: 40000
	},
	{
		id: "total_calories_50k",
		title: "Metabolic Master",
		description: "Burn 50,000 total calories",
		icon: "☀️",
		type: "calories",
		threshold: 50000
	},
	{
		id: "total_calories_60k",
		title: "60,000 Calorie Burn",
		description: "Burn 60,000 total calories",
		icon: "☀️",
		type: "calories",
		threshold: 60000
	},
	{
		id: "total_calories_70k",
		title: "70,000 Calorie Burn",
		description: "Burn 70,000 total calories",
		icon: "☀️",
		type: "calories",
		threshold: 70000
	},
	{
		id: "total_calories_80k",
		title: "80,000 Calorie Burn",
		description: "Burn 80,000 total calories",
		icon: "☀️",
		type: "calories",
		threshold: 80000
	},
	{
		id: "total_calories_90k",
		title: "90,000 Calorie Burn",
		description: "Burn 90,000 total calories",
		icon: "☀️",
		type: "calories",
		threshold: 90000
	}
]

// Streak awards (checked separately)
const STREAK_AWARDS = [
	{
		id: "streak_2",
		title: "Consistency Kickoff",
		description: "Meet your daily goal 2 days in a row",
		icon: "🌱",
		days: 2
	},
	{
		id: "streak_3",
		title: "3 Day Streak",
		description: "Meet your daily goal 3 days in a row",
		icon: "⭐",
		days: 3
	},
	{
		id: "streak_7",
		title: "Week Warrior",
		description: "Meet your daily goal 7 days in a row",
		icon: "🌟",
		days: 7
	},
	{
		id: "streak_14",
		title: "Two Week Champion",
		description: "Meet your daily goal 14 days in a row",
		icon: "🏆",
		days: 14
	},
	{
		id: "streak_21",
		title: "21 Day Habit",
		description: "Meet your daily goal 21 days in a row",
		icon: "🎯",
		days: 21
	},
	{
		id: "streak_30",
		title: "Month Master",
		description: "Meet your daily goal 30 days in a row",
		icon: "👑",
		days: 30
	},
	{
		id: "streak_60",
		title: "60 Day Legend",
		description: "Meet your daily goal 60 days in a row",
		icon: "💎",
		days: 60
	},
	{
		id: "streak_100",
		title: "Century Club",
		description: "Meet your daily goal 100 days in a row",
		icon: "🏅",
		days: 100
	},
	{
		id: "streak_365",
		title: "Year of Walking",
		description: "Meet your daily goal 365 days in a row",
		icon: "🎖️",
		days: 365
	}
]

const Awards = {
	definitions: AWARD_DEFINITIONS,
	streak_definitions: STREAK_AWARDS,
	cumulative_definitions: CUMULATIVE_AWARDS,

	/**
	 * Check entry against all awards
	 * @param {Object} entry - Entry to check
	 * @param {Object} settings - User settings
	 * @param {Function} unlock_callback - Callback when award unlocked
	 * @returns {Array} Newly unlocked award IDs
	 */
	check_entry(entry, settings, unlock_callback) {
		const unlocked = []

		this.definitions.forEach(award => {
			if (award.check(entry, settings)) {
				const result = unlock_callback(award.id, entry.date)

				if (result) {
					unlocked.push(award.id)
				}
			}
		})

		return unlocked
	},

	/**
	 * Check streak awards
	 * @param {number} current_streak - Current streak count
	 * @param {Function} unlock_callback - Callback when award unlocked
	 * @returns {Array} Newly unlocked award IDs
	 */
	check_streak(current_streak, unlock_callback) {
		const unlocked = []
		const today = get_date_string()

		this.streak_definitions.forEach(award => {
			if (current_streak >= award.days) {
				const result = unlock_callback(award.id, today)

				if (result) {
					unlocked.push(award.id)
				}
			}
		})

		return unlocked
	},

	/**
	 * Check cumulative awards
	 * @param {Object} stats - Aggregated statistics (total_steps, total_distance_km, total_calories)
	 * @param {Function} unlock_callback - Callback when award unlocked
	 * @returns {Array} Newly unlocked award IDs
	 */
	check_cumulative(stats, unlock_callback) {
		const unlocked = []
		const today = get_date_string()

		this.cumulative_definitions.forEach(award => {
			let value = 0

			if (award.type === "steps") {
				value = stats.total_steps
			} else if (award.type === "distance") {
				value = stats.total_distance_km
			} else if (award.type === "calories") {
				value = stats.total_calories
			}

			if (value >= award.threshold) {
				const result = unlock_callback(award.id, today)

				if (result) {
					unlocked.push(award.id)
				}
			}
		})

		return unlocked
	},

	/**
	 * Get difficulty level for an award
	 * @param {Object} award - Award definition
	 * @returns {string} Difficulty level: 'beginner', 'easy', 'medium', 'hard', 'expert'
	 */
	get_difficulty(award) {
		const id = award.id

		// Beginner: Very easy, anyone can do on first walk
		const beginner = [
			"first_entry", "steps_500", "steps_1k", "steps_2k", "steps_2500",
			"time_5min", "time_10min", "time_15min",
			"calories_25", "calories_50",
			"distance_500m", "distance_1km", "distance_2km",
			"streak_2",
			"short_walk"
		]

		if (beginner.includes(id)) {
			return "beginner"
		}

		// Easy: casual daily walking
		const easy = [
			"steps_3k", "steps_4k", "steps_5k", "steps_6k",
			"time_20min", "time_25min", "time_30min",
			"calories_100", "calories_150",
			"distance_3km", "distance_4km", "distance_5km",
			"streak_3", "streak_7",
			"morning_person"
		]

		if (easy.includes(id)) {
			return "easy"
		}

		// Medium: regular active walking
		const medium = [
			"steps_7500", "steps_8k", "steps_9k", "steps_10k",
			"time_35min", "time_45min", "time_50min", "time_1hr",
			"calories_175", "calories_200", "calories_225", "calories_250", "calories_300",
			"distance_6km", "distance_7km", "distance_8km",
			"streak_14",
			"perfect_10k", "nice_steps", "lucky_7", "round_number", "consistent_steps", "steady_pace"
		]

		if (medium.includes(id)) {
			return "medium"
		}

		// Hard: dedicated walking
		const hard = [
			"steps_11k", "steps_12500", "steps_13k", "steps_15k",
			"time_75min", "time_90min", "time_100min", "time_2hr",
			"calories_350", "calories_400", "calories_500",
			"distance_9km", "distance_10km", "distance_11km", "distance_12km",
			"streak_21", "streak_30",
			"double_goal", "balanced_walk"
		]

		if (hard.includes(id)) {
			return "hard"
		}

		// Cumulative awards difficulty
		if (id.startsWith("total_steps_") || id.startsWith("total_distance_") || id.startsWith("total_calories_")) {
			// Threshold based difficulty
			const threshold = award.threshold

			if (award.type === "steps") {
				if (threshold < 10000) {
					return "beginner"
				}

				if (threshold <= 50000) {
					return "easy"
				}

				if (threshold <= 100000) {
					return "medium"
				}

				if (threshold <= 250000) {
					return "hard"
				}

				return "expert"
			}

			if (award.type === "distance") {
				if (threshold < 10) {
					return "beginner"
				}

				if (threshold <= 50) {
					return "easy"
				}

				if (threshold <= 100) {
					return "medium"
				}

				if (threshold <= 250) {
					return "hard"
				}

				return "expert"
			}

			if (award.type === "calories") {
				if (threshold < 1000) {
					return "beginner"
				}

				if (threshold <= 5000) {
					return "easy"
				}

				if (threshold <= 10000) {
					return "medium"
				}

				if (threshold <= 25000) {
					return "hard"
				}

				return "expert"
			}
		}

		// Expert: everything else (high milestones, long streaks, long distances)
		return "expert"
	},

	/**
	 * Get all awards with unlock status
	 * @param {Array} unlocked_awards - Array of unlocked award objects
	 * @param {Object} stats - Optional current stats for progress tracking
	 * @returns {Array} All awards with status
	 */
	get_all_with_status(unlocked_awards, stats = null) {
		const unlocked_map = {}

		unlocked_awards.forEach(a => {
			unlocked_map[a.id] = a
		})

		const all = [...this.definitions, ...this.streak_definitions, ...this.cumulative_definitions]

		return all.map(def => {
			const achieved = !!unlocked_map[def.id]
			let progress = null
			let current_value = null

			// Calculate progress for cumulative awards if not achieved
			if (!achieved && stats && def.threshold) {
				let value = 0

				if (def.type === "steps") {
					value = stats.total_steps
				} else if (def.type === "distance") {
					value = stats.total_distance_km
				} else if (def.type === "calories") {
					value = stats.total_calories
				}

				current_value = value
				progress = Math.min(0.99, value / def.threshold) // Cap at 99% if not actually unlocked
			}

			return {
				...def,
				achieved,
				progress,
				current_value,
				date: unlocked_map[def.id]?.date || null,
				viewed: unlocked_map[def.id]?.viewed || false,
				difficulty: this.get_difficulty(def)
			}
		})
	},

	/**
	 * Get award by ID
	 * @param {string} id - Award ID
	 * @returns {Object|null} Award definition
	 */
	get_by_id(id) {
		return this.definitions.find(a => a.id === id) ||
			this.streak_definitions.find(a => a.id === id) ||
			null
	},

	/**
	 * Get count of unlocked awards
	 * @param {Array} unlocked_awards - Array of unlocked award objects
	 * @returns {Object} Count object { unlocked, total }
	 */
	get_count(unlocked_awards) {
		const total = this.definitions.length + this.streak_definitions.length + this.cumulative_definitions.length

		return {
			unlocked: unlocked_awards.length,
			total
		}
	},

	/**
	 * Render award gallery HTML
	 * @param {Array} unlocked_awards - Array of unlocked award objects
	 * @returns {string} HTML string
	 */
	render_gallery(unlocked_awards) {
		const all = this.get_all_with_status(unlocked_awards)

		return all.map(award => `
            <div class="award-badge ${award.achieved ? "" : "locked"}" data-tooltip="${award.description}">
                <div class="award-badge-icon">${award.icon}</div>
                <div class="award-badge-title">${award.title}</div>
                ${award.achieved ? `<div class="award-badge-date">✓</div>` : ""}
            </div>
        `).join("")
	}
}

export default Awards
export { AWARD_DEFINITIONS, STREAK_AWARDS, CUMULATIVE_AWARDS }
