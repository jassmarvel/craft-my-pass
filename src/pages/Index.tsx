import PasswordGenerator from "@/components/PasswordGenerator";
import BreachChecker from "@/components/BreachChecker"; // Changed from PwnedChecker
import SecurityTip from "@/components/SecurityTip";

const Index = () => {
  return (
    <div>
      <PasswordGenerator />
      <div className="max-w-2xl mx-auto">
        <BreachChecker /> {/* Changed from PwnedChecker */}
        <SecurityTip />
      </div>
    </div>
  );
};

export default Index;