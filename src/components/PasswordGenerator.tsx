import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Shield, RefreshCw } from "lucide-react";
import zxcvbn from "zxcvbn";

// A simple wordlist for generating passphrases. For higher security, a larger list is recommended.
const dicewareWords = [
  "acid", "acorn", "acre", "acts", "afar", "affix", "aged", "agent",
  "agile", "aging", "agony", "ahead", "aide", "aids", "aim", "air",
  "aisle", "ajar", "alarm", "album", "ale", "alert", "alibi", "alice",
  "alien", "alike", "alive", "aloe", "aloft", "aloha", "alone", "amend",
  "amino", "ample", "amuse", "angel", "anger", "angle", "ankle", "apple",
  "april", "apron", "aqua", "area", "arena", "argon", "army", "aroma",
  "array", "arrow", "arson", "art", "ascot", "ashen", "aside", "ask",
  "asleep", "aspire", "atlas", "atom", "attic", "audio", "avert", "avoid",
  "awake", "award", "awoke", "axis", "bacon", "badge", "bagel", "baggy",
  "bait", "baker", "bang", "banjo", "barge", "barn", "bash", "basic",
  "bask", "batch", "bath", "baton", "bats", "blade", "blank", "blast",
  "blaze", "bleak", "blend", "bless", "blimp", "blink", "bloat", "blob",
  "blog", "blot", "blunt", "blurt", "blush", "boast", "boat", "body",
  "boil", "bok", "bolt", "boned", "boney", "bonus", "bony", "book",
  "booth", "booty", "booze", "borax", "bore", "bosh", "both", "boxer",
  "breed", "bribe", "brick", "bride", "brim", "bring", "brink", "brisk",
  "broad", "broil", "broke", "brook", "broom", "brush", "brute", "bubble",
  "buck", "budget", "buff", "buggy", "bulb", "bulge", "bulky", "bull",
  "bunch", "bunny", "bunt", "bush", "bust", "busy", "buzz", "cable"
];

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  customText: string;
  excludeChars: string;
}

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: false,
    customText: "",
    excludeChars: "",
  });
  
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 6,
    separator: '-',
  });
  const [generatorType, setGeneratorType] = useState<'password' | 'passphrase'>('password');
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [strength, setStrength] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (generatedPassword) {
      const analysis = zxcvbn(generatedPassword);
      setStrength(analysis);
    }
  }, [generatedPassword]);

  const generate = () => {
    if (generatorType === 'password') {
      generatePassword();
    } else {
      generateNewPassphrase();
    }
  };

  const generateNewPassphrase = () => {
    setIsGenerating(true);
    try {
      const passphraseArray = [];
      for (let i = 0; i < passphraseOptions.wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * dicewareWords.length);
        passphraseArray.push(dicewareWords[randomIndex]);
      }
      let finalPassphrase = passphraseArray.join(passphraseOptions.separator);
      
      // Append a random number to the end
      finalPassphrase += Math.floor(Math.random() * 10);
      
      setGeneratedPassword(finalPassphrase);
      toast({
        title: "Passphrase Generated!",
        description: "Your secure passphrase is ready to use.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate passphrase.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePassword = () => {
    setIsGenerating(true);

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charset = "";
    if (options.includeUppercase) charset += uppercase;
    if (options.includeLowercase) charset += lowercase;
    if (options.includeNumbers) charset += numbers;
    if (options.includeSpecialChars) charset += specialChars;

    if (options.excludeChars) {
      for (let i = 0; i < options.excludeChars.length; i++) {
        charset = charset.replace(new RegExp(`\\${options.excludeChars[i]}`, 'g'), '');
      }
    }

    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }
    
    const customTextLength = options.customText.length;
    if (customTextLength > 0 && customTextLength >= options.length) {
      toast({
        title: "Error",
        description: "Custom text is too long for the selected password length.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    const randomLength = options.length - customTextLength;

    let randomChars = "";
    for (let i = 0; i < randomLength; i++) {
      randomChars += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    let finalPassword = "";

    if (options.customText) {
      const randomArray = randomChars.split('');
      const customTextArray = options.customText.split('');
      const insertPosition = Math.floor(Math.random() * (randomArray.length + 1));
      const beforeCustom = randomArray.slice(0, insertPosition);
      const afterCustom = randomArray.slice(insertPosition);
      finalPassword = [...beforeCustom, ...customTextArray, ...afterCustom].join('');
    } else {
      finalPassword = randomChars;
    }

    setTimeout(() => {
      setGeneratedPassword(finalPassword);
      setIsGenerating(false);
      toast({
        title: "Password Generated!",
        description: "Your secure password is ready to use.",
      });
    }, 500);
  };

  const copyToClipboard = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password.",
        variant: "destructive",
      });
    }
  };

  const downloadPassword = () => {
    if (!generatedPassword) return;
    const blob = new Blob([generatedPassword], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "password.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({
      title: "Downloaded!",
      description: "Password saved as password.txt",
    });
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CraftMyPass
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Generate secure, customizable passwords with advanced options for maximum protection.
          </p>
        </div>

        <Card className="shadow-card animate-slide-up backdrop-blur-sm bg-card/95 border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Password Generator
            </CardTitle>
            <CardDescription>
              Configure your password settings and generate a secure password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setGeneratorType('password')} variant={generatorType === 'password' ? 'default' : 'outline'}>Password</Button>
              <Button onClick={() => setGeneratorType('passphrase')} variant={generatorType === 'passphrase' ? 'default' : 'outline'}>Passphrase</Button>
            </div>

            {generatorType === 'password' ? (
              <>
                <div className="space-y-3">
                  <Label htmlFor="length" className="text-sm font-medium">
                    Password Length: {options.length}
                  </Label>
                  <Slider
                    id="length"
                    min={4} max={128} step={1}
                    value={[options.length]}
                    onValueChange={(value) => setOptions((prev) => ({ ...prev, length: value[0] }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Include Characters</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="uppercase"
                        checked={options.includeUppercase}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeUppercase: checked }))}
                      />
                      <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lowercase"
                        checked={options.includeLowercase}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeLowercase: checked }))}
                      />
                      <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="numbers"
                        checked={options.includeNumbers}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeNumbers: checked }))}
                      />
                      <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="special"
                        checked={options.includeSpecialChars}
                        onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeSpecialChars: checked }))}
                      />
                      <Label htmlFor="special" className="text-sm">Special (!@#$...)</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customText" className="text-sm font-medium">Custom Text (Optional)</Label>
                  <Input
                    id="customText"
                    placeholder="Enter text to include in password"
                    value={options.customText}
                    onChange={(e) => setOptions((prev) => ({ ...prev, customText: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">This text will be included somewhere in your password</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excludeChars" className="text-sm font-medium">Exclude Characters (Optional)</Label>
                  <Input
                    id="excludeChars"
                    placeholder="e.g., oO0,;: "
                    value={options.excludeChars}
                    onChange={(e) => setOptions((prev) => ({ ...prev, excludeChars: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="wordCount" className="text-sm font-medium">Number of Words: {passphraseOptions.wordCount}</Label>
                  <Slider
                    id="wordCount"
                    min={3} max={10} step={1}
                    value={[passphraseOptions.wordCount]}
                    onValueChange={(value) => setPassphraseOptions((prev) => ({ ...prev, wordCount: value[0] }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="separator" className="text-sm font-medium">Separator</Label>
                  <Input
                    id="separator"
                    value={passphraseOptions.separator}
                    onChange={(e) => setPassphraseOptions((prev) => ({ ...prev, separator: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            <Button
              onClick={generate}
              disabled={isGenerating}
              className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isGenerating ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Shield className="w-5 h-5 mr-2" />Generate</>
              )}
            </Button>

            {generatedPassword && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-sm font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-success" />
                  Generated Password
                </Label>
                <div className="relative group">
                  <Input
                    value={generatedPassword}
                    readOnly
                    className="pr-20 font-mono text-lg bg-gradient-card border-2 border-success/20 shadow-glow focus:border-success/40 transition-all duration-300"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                    <Button
                      size="sm" variant="ghost" onClick={copyToClipboard}
                      className="h-8 w-8 p-0 hover:bg-success/10 hover:text-success transition-all duration-200 group"
                    >
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" onClick={downloadPassword}
                      className="h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-all duration-200 group"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
                </div>
                {strength && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Password Strength</Label>
                      <span className={`text-sm font-semibold ${getStrengthColor(strength.score).replace('bg-', 'text-')}`}>
                        {["Weak", "Fair", "Good", "Strong", "Very Strong"][strength.score]}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${getStrengthColor(strength.score)}`}
                        style={{ width: `${((strength.score + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                    {strength.feedback.warning && (
                      <p className="text-xs text-yellow-600">{strength.feedback.warning}</p>
                    )}
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {strength.feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Click the icons to copy to clipboard or download as a file.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Keep your passwords secure and never share them with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
