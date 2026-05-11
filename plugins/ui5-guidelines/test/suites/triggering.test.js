/**
 * Skill Triggering Tests
 * Validates that skills trigger on expected keywords and contexts
 */

const path = require("path")

/**
 * Simple keyword-based skill matcher (simulates Claude's skill selection)
 */
function matchSkill(prompt, skills) {
    const promptLower = prompt.toLowerCase()

    // Anti-patterns: Explicitly non-UI5 frameworks
    const antiPatterns = [
        "react hook",
        "python",
        "express",
        "django",
        "flask",
        "vue",
        "angular",
    ]
    const hasAntiPattern = antiPatterns.some((pattern) =>
        promptLower.includes(pattern)
    )

    if (hasAntiPattern) {
        return null
    }

    // Required: Must contain UI5-related terms (direct or contextual)
    const ui5Terms = [
        "ui5",
        "sapui5",
        "openui5",
        "sap.",
        "component.js",
        "integration card",
        "analytical card",
        "iasynccontentcreation",
        "versioninfo",
        "button$pressevent",
        "table$rowselectionchangeevent",
        "ts-interface-generator",
        "ui5-tooling",
        "$source",
        "$parameters",
        "$event",
        "$controller",
        "odata",
        "xml view",
        "xml event",
        "chart feed",
        "configuration editor",
    ]
    const hasUI5Context = ui5Terms.some((term) => promptLower.includes(term))

    // If no UI5 context, don't match any skill
    if (!hasUI5Context) {
        return null
    }

    const scores = skills.map((skill) => {
        let score = 0

        // Match keywords
        skill.keywords.forEach((keyword) => {
            const keywordLower = keyword.toLowerCase()
            if (promptLower.includes(keywordLower)) {
                score += 2
            }
        })

        // Match description words
        const descWords = skill.description.toLowerCase().split(/\s+/)
        const promptWords = promptLower.split(/\s+/)
        const overlap = descWords.filter(
            (w) => w.length > 3 && promptWords.includes(w)
        ).length
        score += overlap * 0.3

        return { name: skill.name, score }
    })

    scores.sort((a, b) => b.score - a.score)
    return scores[0].score > 0 ? scores[0].name : null
}

module.exports = function runTriggeringTests(framework) {
    console.log("\n🎯 Skill Triggering Tests")
    console.log("-".repeat(70))

    const plugin = framework.loadPluginJson()

    // Load all skill metadata
    const skills = plugin.skills.map((skillPath) => {
        const metadata = framework.loadSkillMetadata(skillPath)
        return {
            name: metadata.name,
            description: metadata.description,
            keywords: metadata.keywords,
        }
    })

    // Load test cases
    const testCasesPath = path.join(
        framework.pluginRoot,
        "test",
        "fixtures",
        "trigger-cases.json"
    )
    let testCases

    try {
        testCases = require(testCasesPath)
    } catch (err) {
        console.log(
            "  ⚠️  No trigger test cases found at fixtures/trigger-cases.json"
        )
        console.log("     Skipping triggering tests.")
        return
    }

    // Run each test case
    testCases.tests.forEach((testCase) => {
        framework.test(`"${testCase.prompt.substring(0, 50)}..."`, () => {
            const matched = matchSkill(testCase.prompt, skills)

            if (testCase.should_trigger) {
                // Should trigger the expected skill
                if (matched !== testCase.expected_skill) {
                    throw new Error(
                        `Expected "${testCase.expected_skill}", got "${matched || "none"}"`
                    )
                }
            } else {
                // Should NOT trigger any skill (matched should be null)
                if (matched !== null) {
                    throw new Error(
                        `Should not trigger any skill, but matched "${matched}"`
                    )
                }
            }
        })
    })

    // Calculate accuracy
    const total = testCases.tests.length
    const passed = framework.results.tests.filter(
        (t) => t.name.includes('"') && t.status === "passed"
    ).length
    const accuracy = total > 0 ? ((passed / total) * 100).toFixed(1) : 0

    console.log(`\n  📊 Triggering Accuracy: ${passed}/${total} (${accuracy}%)`)

    if (accuracy < 80) {
        console.log(
            "  ⚠️  Accuracy below 80% - consider improving skill descriptions"
        )
    }
}
