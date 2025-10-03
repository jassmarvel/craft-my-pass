import { Lightbulb } from "lucide-react";

const tips = [
  "Use a unique password for every website.",
  "Enable two-factor authentication whenever possible.",
  "Be cautious of phishing emails asking for your password.",
  "Regularly review the security settings on your important accounts.",
  "A long passphrase is often stronger and easier to remember than a short, complex password.",
];

export default function SecurityTip() {
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="mt-8 p-4 bg-blue-100 text-blue-800 rounded-lg flex items-center space-x-3">
      <Lightbulb className="w-5 h-5" />
      <div>
        <h4 className="font-semibold">Security Tip:</h4>
        <p className="text-sm">{tip}</p>
      </div>
    </div>
  );
}