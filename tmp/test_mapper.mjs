import { mapN8nToAiMessage } from '../react-sidebar/src/utils/n8nMapper.js';

const metricPayload = [
    {
        "period_days": 7,
        "priority": "All Priorities",
        "velocity": "",
        "lead_time": 10.9,
        "cycle_time": 10.8,
        "resolved_count": 2
    }
];

const ticketPayload = [
    {
        "query": "test query",
        "Key": "EAB-123",
        "Summary": "Test Ticket",
        "Status": "Done",
        "Priority": "P1",
        "Workaround": "Just do it"
    }
];

const analysisPayload = {
    steps: ["Step 1", "Step 2"],
    confidence: "high"
};

console.log("--- Testing Metric Payload ---");
const result = mapN8nToAiMessage(metricPayload);
console.log(JSON.stringify(result, null, 2));

if (result.type === 'html' && result.content.includes('<strong>') && result.content.includes('<br/>')) {
    console.log("SUCCESS: Metric payload correctly formatted as HTML.");
} else {
    console.log("FAILURE: Metric payload formatting issue.");
}

console.log("\n--- Testing Ticket Payload ---");
console.log(JSON.stringify(mapN8nToAiMessage(ticketPayload), null, 2));

console.log("\n--- Testing Analysis Payload ---");
console.log(JSON.stringify(mapN8nToAiMessage(analysisPayload), null, 2));
