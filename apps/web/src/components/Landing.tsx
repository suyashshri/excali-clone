import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Pencil, Share2, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to SketchFlow</h1>
        <p className="text-xl mb-8 max-w-2xl">
          Create beautiful diagrams, wireframes, and illustrations with our
          easy-to-use drawing tool. Collaborate in real-time with your team and
          bring your ideas to life.
        </p>
        <div className="flex space-x-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      <section className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pencil className="mr-2" /> Intuitive Drawing
              </CardTitle>
            </CardHeader>
            <CardContent>
              Easy-to-use tools for creating diagrams, sketches, and wireframes
              with a simple and intuitive interface.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" /> Real-time Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              Work together with your team in real-time, seeing changes
              instantly as you collaborate on your projects.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2" /> Easy Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              Share your creations with a simple link, allowing others to view
              or edit your work with customizable permissions.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-xl mb-8">
          Join thousands of teams already using SketchFlow to bring their ideas
          to life.
        </p>
        <Button asChild size="lg">
          <Link href="/sign-up">
            Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
