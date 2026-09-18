export const MOULI_DIALOGUE = {
  start: {
    speaker: "Mouli",
    title: "Full Stack Engineer & Creator",
    text: "Welcome, traveller! You've found my interactive digital studio. I build scalable full-stack applications, immersive 3D web worlds, and intelligent autonomous systems. What brings you here today?",
    options: [
      { text: "Who are you and what is your background?", next: "about" },
      { text: "What kind of projects do you build?", next: "projects_info" },
      { text: "What is your philosophy on technology and design?", next: "philosophy" },
      { text: "How can we collaborate or work together?", next: "contact_info" },
      { text: "Just exploring your 3D world! (Leave)", next: "close" }
    ]
  },
  about: {
    speaker: "Mouli",
    title: "About Mouli",
    text: "I'm a passionate software engineer with deep expertise across modern web engineering, distributed backends, and creative 3D computing. I love bridging the gap between rigorous systems performance and delightful, artistic user experiences.",
    options: [
      { text: "Where can I see your projects in this world?", next: "direct_projects" },
      { text: "Tell me about your technical skills.", next: "skills_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  projects_info: {
    speaker: "Mouli",
    title: "Projects & Architecture",
    text: "Head north to the Project Lab! You'll find physical 3D stations representing NeuralFlow AI (autonomous agent pipelines), QuantumOps Cloud (eBPF K8s observability), NexusRealtime (CRDT sync), and HyperEngine 3D. At the heart of the sector stands the massive Core Spire.",
    options: [
      { text: "That sounds awesome! I'll go inspect them.", next: "close" },
      { text: "Tell me about your skills.", next: "skills_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  direct_projects: {
    speaker: "Mouli",
    title: "Navigation Tip",
    text: "Exit my house, follow the glowing floor conduits past the fountain plaza, and you will see the bright holographic sign for the Project Lab on your right. Check your minimap in the top-right corner!",
    options: [
      { text: "Understood! Thanks Mouli.", next: "close" }
    ]
  },
  skills_info: {
    speaker: "Mouli",
    title: "Technical Stack",
    text: "I work fluently with React 19, TypeScript, Node.js, Go, Python, Docker, Kubernetes, and WebGL/Three.js. Beyond the Project Lab, step into the Skill Arena to walk around an interactive 3D skill tree!",
    options: [
      { text: "Let's check out the Skill Arena.", next: "close" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  philosophy: {
    speaker: "Mouli",
    title: "Core Philosophy",
    text: "Software shouldn't just be functional—it should be fast, resilient, and evoke genuine wonder. When you treat code as craft and digital interaction as an art form, user engagement transforms into pure excitement.",
    options: [
      { text: "I love that mindset! How can we connect?", next: "contact_info" },
      { text: "Back to main topics.", next: "start" }
    ]
  },
  contact_info: {
    speaker: "Mouli",
    title: "Communication",
    text: "You can reach me directly through the Contact Station at the southern perimeter of the world, or through the Pause Menu [ESC] anytime. I'm always open to groundbreaking engineering roles, consulting, and ambitious collaborative builds.",
    options: [
      { text: "Awesome! I'll visit the Contact Station.", next: "close" },
      { text: "Back to main topics.", next: "start" }
    ]
  }
};
