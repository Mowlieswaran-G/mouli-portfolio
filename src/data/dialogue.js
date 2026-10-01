export const MOULI_DIALOGUE = {
  start: {
    speaker: "Mouli",
    title: "Systems Architect & Full Stack Lead",
    text: "Welcome! You've arrived at my Executive Innovation Studio. I architect scalable cloud backends, reactive full-stack platforms, and high-performance interactive 3D systems. What brings you to the campus today?",
    options: [
      { text: "Who are you and what is your background?", next: "about" },
      { text: "What kind of systems and platforms do you engineer?", next: "projects_info" },
      { text: "What is your philosophy on engineering and craft?", next: "philosophy" },
      { text: "How can we collaborate on engineering opportunities?", next: "contact_info" },
      { text: "Just exploring the campus! (Leave)", next: "close" }
    ]
  },
  about: {
    speaker: "Mouli",
    title: "About Mouli",
    text: "I'm a full stack software engineer and systems architect specializing in high-concurrency microservices, reactive frontend architectures, and WebGL graphics computing. I focus on combining robust distributed reliability with world-class user experience.",
    options: [
      { text: "Where can I inspect your platforms in this campus?", next: "direct_projects" },
      { text: "Tell me about your technical competencies.", next: "skills_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  projects_info: {
    speaker: "Mouli",
    title: "Platforms & Systems Architecture",
    text: "Head north across the plaza to the Innovation Gallery! You'll find 3D exhibition stations for NeuralFlow AI (autonomous agent pipelines), QuantumOps Cloud (eBPF telemetry), NexusRealtime (CRDT peer sync), and HyperEngine 3D. Beyond the bay stands the monumental Quantum Core Spire.",
    options: [
      { text: "Superb! I'll go inspect them.", next: "close" },
      { text: "Tell me about your core stack.", next: "skills_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  direct_projects: {
    speaker: "Mouli",
    title: "Navigation Waypoint",
    text: "Exit the studio and follow the inlaid architectural light channels past the central plaza sculpture. You'll see the illuminated Innovation Gallery directly ahead. Keep an eye on your radar minimap in the top right corner!",
    options: [
      { text: "Understood! Thank you, Mouli.", next: "close" }
    ]
  },
  skills_info: {
    speaker: "Mouli",
    title: "Engineering Stack",
    text: "My core competencies span TypeScript, React 19, Go, Python, Node.js, Docker, Kubernetes, AWS, and WebGL / Three.js. Step into the Technology Atrium on the eastern wing to inspect the interactive 3D skill tree!",
    options: [
      { text: "Let's visit the Technology Atrium.", next: "close" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  philosophy: {
    speaker: "Mouli",
    title: "Engineering Philosophy",
    text: "Excellence in software requires two things: unyielding architectural discipline on the backend, and relentless attention to human emotion on the frontend. When performance is instant and visual aesthetics are breathtaking, technology feels like magic.",
    options: [
      { text: "Inspiring perspective! How can we connect?", next: "contact_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  contact_info: {
    speaker: "Mouli",
    title: "Executive Inquiries",
    text: "You can transmit an encrypted dispatch through the Executive Comms station at the southern perimeter of the campus, or through the Pause Menu [ESC] anytime. I'm actively considering high-impact technical leadership, architecture roles, and elite collaborative projects.",
    options: [
      { text: "Excellent! I'll visit the Comms station.", next: "close" },
      { text: "Back to main topics.", next: "start" }
    ]
  }
};
