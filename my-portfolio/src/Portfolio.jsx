import React from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Github, Mail, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const projects = [
  {
    title: "Pantry Wizard",
    description: "An AI-driven recipe generator based on available ingredients.",
    link: "https://github.com/your-username/pantry-wizard"
  },
  {
    title: "Oak Browser",
    description: "A lightweight browser built in Zig with SDL and curl.",
    link: "https://github.com/your-username/oak-browser"
  },
  {
    title: "Deep Thought",
    description: "An AI-centric VS Code clone with DeepSeek integration.",
    link: "https://github.com/your-username/deep-thought"
  }
];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <motion.h1
        className="text-4xl font-bold mt-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Raycifer's Portfolio
      </motion.h1>
      <p className="text-gray-400 mt-2">Software Developer | AI Enthusiast | Builder</p>

      <div className="flex gap-4 mt-6">
        <Button variant="outline" asChild>
          <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
            <Github className="w-5 h-5 mr-2" /> GitHub
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="mailto:your-email@example.com">
            <Mail className="w-5 h-5 mr-2" /> Email
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://linkedin.com/in/your-username" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-5 h-5 mr-2" /> LinkedIn
          </a>
        </Button>
      </div>

      <motion.h2 className="text-2xl font-semibold mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Projects
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {projects.map((project, index) => (
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-gray-800 border-gray-700 p-4">
              <CardContent>
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-gray-400 mt-2">{project.description}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline mt-3 block"
                >
                  View on GitHub →
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
