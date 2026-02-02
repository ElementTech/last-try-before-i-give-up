# Camera and Scene Composition Rules

## CRITICAL: Never Make False Quality Claims

**MISTAKE I MADE:** I claimed the scene was "50% quality" when it was actually 10-15% because:
1. I looked at automated close-up screenshots, not the actual user view
2. I focused on "elements present" rather than "does it look good"
3. I didn't verify the full scene composition matches the reference

**RULE:** Before claiming ANY quality percentage:
1. Take a screenshot from the ACTUAL user's camera angle
2. Compare the FULL SCENE composition to reference (not just individual elements)
3. Be brutally honest - if it looks broken, say it looks broken
4. Quality is judged by overall appearance, not by technical checklist

## Camera Positioning for Terrain Scenes

When matching reference images that show terrain overview:

**Reference Image Analysis (videoframe_30819.png):**
- Camera height: High enough to see large terrain area (300-500 units above terrain)
- Camera angle: 45-60 degree angle looking down at terrain
- Field of view: Can see multiple forests, roads, and terrain features in one view
- Distance from center: Far enough to show overview (400-600 units from center)

**CORRECT Camera Setup:**
```javascript
camera.position.set(400, 400, 400); // High and far for overview
camera.lookAt(0, 0, 0); // Look at terrain center
controls.target.set(0, 0, 0);
```

**WRONG Camera Setup (my mistakes):**
```javascript
// TOO CLOSE - shows only individual tree trunks
camera.position.set(150, 350, 200);

// TOO LOW - shows terrain from ground level
camera.position.set(300, 120, 300);
```

## Object Scaling

**Tree Scale for Kenney Models:**
- Kenney tree models are already realistic size
- For a 1000-unit world size, scale should be **3-8** (not 15-25!)
- Trees should look like individual trees in the overview, not giant mountains

**WRONG:**
```javascript
const scale = 15 + Math.random() * 10; // Makes trees HUGE
```

**CORRECT:**
```javascript
const scale = 4 + Math.random() * 4; // Realistic tree size
```

## Verification Process

Before claiming success:
1. **Take screenshot** from the actual camera position
2. **ASK USER TO VERIFY** - My automated screenshots may not match what user sees in browser
3. **Compare to reference** - does the OVERALL COMPOSITION match?
4. **Check scale relationships** - are trees/roads/terrain proportional?
5. **Be honest** - if it looks nothing like reference, say so

## Critical Mistakes I Made

**MISTAKE 1: Camera Looking Up Instead of Down**
- Symptom: User sees underside of terrain, looking up at cone/spike
- Cause: Camera position or terrain orientation is inverted
- Fix: Ensure camera.position.y > terrain and camera looks DOWN at terrain

**MISTAKE 2: Automated Screenshots Don't Match User's Browser**
- Symptom: My screenshots look different than user's actual view
- Cause: Puppeteer timing, different rendering, or camera issues
- Fix: ALWAYS ask user to verify before claiming quality percentage

**MISTAKE 3: Claiming Quality Without Verifying User's View**
- I claimed "70-75% quality" when user's view was 0% (completely broken)
- NEVER claim any quality % until user confirms scene looks correct

## Quality Assessment Rules

- **90-100%**: Looks nearly identical to reference, could be production-ready
- **70-89%**: Clearly similar style, minor differences in detail
- **50-69%**: Same elements present, noticeable quality gaps
- **30-49%**: Has basic elements but looks significantly different
- **10-29%**: Barely resembles reference, major issues
- **0-9%**: Completely broken or wrong

**NEVER overestimate quality to be optimistic.**
