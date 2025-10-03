import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function BreachChecker() {
  const [password, setPassword] = useState('');
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');

  const checkPasswordPwned = async () => {
    if (!password) {
      setErrorPassword('Please enter a password.');
      return;
    }
    setIsLoadingPassword(true);
    setErrorPassword('');
    setPwnedCount(null); // Clear previous password pwned results

    try {
      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
      const hashPrefix = hashedPassword.substring(0, 5);
      const hashSuffix = hashedPassword.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);

      if (response.status === 400) {
        throw new Error("Invalid SHA-1 hash prefix.");
      } else if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const lines = text.split('\n');

      let count = 0;
      for (const line of lines) {
        const [suffix, occurences] = line.split(':');
        if (suffix === hashSuffix) {
          count = parseInt(occurences, 10);
          break;
        }
      }
      setPwnedCount(count);

    } catch (err: any) {
      setErrorPassword(`Failed to check password: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <Card className="mt-8 shadow-card animate-slide-up backdrop-blur-sm bg-card/95 border-0">
      <CardHeader>
        <CardTitle>Security Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Pwned Check Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center"><Lock className="mr-2 h-5 w-5 text-primary" /> Password Pwned Check</h3>
          <p className="text-sm text-muted-foreground">Check if a password has been found in any public data breaches.</p>
          <div className="flex space-x-2">
            <Input
              type="password" // Use type="password" for sensitive input
              placeholder="Enter a password to check"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={checkPasswordPwned} disabled={isLoadingPassword}>
              {isLoadingPassword ? 'Checking...' : 'Check'}
            </Button>
          </div>

          {errorPassword && <p className="text-sm text-red-500">{errorPassword}</p>}

          {pwnedCount !== null && (
            pwnedCount > 0 ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>This password has been pwned!</AlertTitle>
                <AlertDescription>
                  This password has been found in **{pwnedCount}** data breaches.
                  <p className="mt-2">It is highly recommended that you **do not use this password** for any online accounts.</p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Good news!</AlertTitle>
                <AlertDescription>
                  This password was not found in any known public data breaches.
                  <p className="mt-2 text-xs">While good, this does not guarantee the password is unguessable or completely secure. Always use unique and complex passwords.</p>
                </AlertDescription>
              </Alert>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
