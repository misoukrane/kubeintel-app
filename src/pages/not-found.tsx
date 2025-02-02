import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export const NotFound = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-bold">Page not found</h1>
        </CardHeader>
        <CardContent className="text-center">
          <p>The page you're looking for doesn't exist or has been moved.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
