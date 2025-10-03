import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lock, Mail } from 'lucide-react'; // Added Lock and Mail icons
import CryptoJS from 'crypto-js'; // <-- This line should be present

export default function BreachChecker() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [breaches, setBreaches] = useState<any[] | null>(null);
  const [pwnedCount, setPwnedCount] = useState<number | null>(null); // For password pwned count
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const checkEmailBreaches = async () => {
    if (!email) {
      setErrorEmail('Please enter an email address.');
      return;
    }
    setIsLoadingEmail(true);
    setErrorEmail('');
    setBreaches(null); // Clear previous email breach results

    try {
      // Note: The HIBP API requires an API key for production use on the 'breachedaccount' endpoint.
      // For a public/demo app, you might be rate-limited or blocked without one.
      // This example assumes direct access or a proxy.
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': import.meta.env.VITE_HIBP_API_KEY || '', // Use environment variable for API key
          'User-Agent': 'CraftMyPass-App' // HIBP requires a user-agent
        }
      });

      if (response.status === 404) {
        setBreaches([]);
      } else if (response.ok) {
        const data = await response.json();
        setBreaches(data);
      } else {
        // Handle other error codes, e.g., 401 for invalid API key, 429 for rate limit
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'Failed to fetch data.'}`);
      }
    } catch (err: any) {
      setErrorEmail(`Failed to check email: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setIsLoadingEmail(false);
    }
  };

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
        <CardTitle>Security Checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Breach Check Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" /> Email Breach Check</h3>
          <p className="text-sm text-muted-foreground">Check if your email address has appeared in known data breaches.</p>
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={checkEmailBreaches} disabled={isLoadingEmail}>
              {isLoadingEmail ? 'Checking...' : 'Check'}
            </Button>
          </div>

          {errorEmail && <p className="text-sm text-red-500">{errorEmail}</p>}

          {breaches && (
            breaches.length > 0 ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Oh no — pwned!</AlertTitle>
                <AlertDescription>
                  This email has been found in the following data breaches:
                  <ul className="list-disc list-inside mt-2">
                    {breaches.map((breach) => (
                      <li key={breach.Name}>{breach.Name}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">Consider changing passwords for accounts associated with these breaches.</p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Good news!</AlertTitle>
                <AlertDescription>
                  This email address was not found in any of the data breaches.
                </AlertDescription>
              </Alert>
            )
          )}
        </div>

        {/* Password Pwned Check Section */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold flex items-center"><Lock className="mr-2 h-5 w-5 text-primary" /> Password Pwned Check</h3>
          <p className="text-sm text-muted-foreground">Check if a specific password has been found in any public data breaches.</p>
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