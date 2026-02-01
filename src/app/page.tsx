import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Lock, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center justify-between px-6 border-b bg-background">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <span>PM</span> Contsystem
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Request Access</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center space-y-8 bg-muted/20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl mx-auto">
            Project Management for <span className="text-primary">Professionals</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your workflow with our advanced timeline, secure team collaboration, and industrial-grade reliability.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Interactive Timeline</h3>
            <p className="text-muted-foreground">Visualize your project schedule with our powerful Gantt chart view.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Access</h3>
            <p className="text-muted-foreground">Invite-only platform ensuring your corporate data stays protected.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Team Collaboration</h3>
            <p className="text-muted-foreground">Assign tasks and track progress with your entire team in real-time.</p>
          </div>
        </section>
      </main>
      <footer className="py-6 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Contsystem Group SE. All rights reserved.
      </footer>
    </div>
  )
}
