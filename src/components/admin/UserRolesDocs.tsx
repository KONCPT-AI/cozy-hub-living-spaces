import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Eye, Plus, Edit, Trash2, CheckCircle, Home, BedDouble, CreditCard, Ticket, Calendar, FileText, BarChart } from 'lucide-react';

const UserRolesDocs = () => {
  const userTypes = [
    {
      icon: Shield,
      title: "Admin",
      description: "Internal team members who operate the system",
      color: "text-primary",
      bgColor: "bg-primary/10",
      features: [
        "Dynamic role-based access control (RBAC)",
        "Flexible permissions per section",
        "Custom role creation by Super Admin",
        "Access to admin dashboard"
      ],
      examples: [
        "Super Admin",
        "Booking Manager",
        "Support Manager",
        "Event Manager",
        "Finance Executive"
      ]
    },
    {
      icon: Users,
      title: "Resident",
      description: "Students and professionals onboarded for stay",
      color: "text-accent",
      bgColor: "bg-accent/10",
      features: [
        "Access via mobile app or portal",
        "Browse and book rooms",
        "Manage bookings & payments",
        "Raise support tickets",
        "RSVP to community events",
        "Receive announcements"
      ],
      examples: [
        "Undergraduate Students",
        "Postgraduate Students",
        "Young Professionals",
        "Remote Workers",
        "Digital Nomads"
      ]
    }
  ];

  const adminSections = [
    { icon: Home, name: "Properties", description: "Manage co-living properties" },
    { icon: BedDouble, name: "Rooms", description: "Room inventory & availability" },
    { icon: Users, name: "Users", description: "Resident & admin management" },
    { icon: Calendar, name: "Bookings", description: "Reservation management" },
    { icon: Ticket, name: "Support Tickets", description: "Maintenance & support" },
    { icon: Calendar, name: "Events", description: "Community events" },
    { icon: CreditCard, name: "Finance", description: "Payments & transactions" },
    { icon: BarChart, name: "Reports", description: "Analytics & insights" }
  ];

  const permissions = [
    { icon: Eye, name: "View", description: "Can only see the section data", color: "text-blue-600" },
    { icon: Plus, name: "Add", description: "Can create new records", color: "text-green-600" },
    { icon: Edit, name: "Edit", description: "Can update existing records", color: "text-amber-600" },
    { icon: Trash2, name: "Delete", description: "Can remove records", color: "text-red-600" }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-heading text-4xl font-bold text-foreground">
          User Management & Role-Based Access
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto font-body">
          A comprehensive guide to understanding user types and dynamic permission management in our platform
        </p>
      </div>

      {/* User Types Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-primary rounded-full" />
          <h2 className="font-heading text-3xl font-bold text-foreground">User Types</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {userTypes.map((type, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${type.bgColor}`}>
                    <type.icon className={`h-8 w-8 ${type.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="font-heading text-2xl">{type.title}</CardTitle>
                    <CardDescription className="font-body text-base mt-1">
                      {type.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Capabilities
                  </h4>
                  <ul className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-body">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Example Roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {type.examples.map((example, idx) => (
                      <Badge key={idx} variant="secondary" className="font-body">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Role-Based Permissions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-primary rounded-full" />
          <h2 className="font-heading text-3xl font-bold text-foreground">Role-Based Permissions</h2>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Dynamic Permission System</CardTitle>
            <CardDescription className="font-body text-base">
              Super Admins can create custom roles and define granular permissions for each admin panel section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Permission Types */}
            <div>
              <h4 className="font-heading font-semibold mb-4 text-lg">Permission Types</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {permissions.map((perm, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="flex justify-center">
                          <div className="p-3 bg-background rounded-lg border">
                            <perm.icon className={`h-6 w-6 ${perm.color}`} />
                          </div>
                        </div>
                        <h5 className="font-heading font-semibold">{perm.name}</h5>
                        <p className="text-xs text-muted-foreground font-body">{perm.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Admin Sections */}
            <div>
              <h4 className="font-heading font-semibold mb-4 text-lg">Admin Panel Sections</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {adminSections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="p-2 rounded bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-medium text-sm">{section.name}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-heading font-semibold">How It Works</h5>
                    <p className="text-sm text-muted-foreground font-body">
                      For each section, Super Admin can enable/disable permissions (View, Add, Edit, Delete) when creating or editing roles. 
                      This creates <strong>custom roles</strong> that can be assigned to different admin users based on their responsibilities.
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-body italic">
                        Example: A "Booking Manager" might have View, Add, and Edit permissions for Bookings, but no Delete permission.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Key Benefits */}
      <Card className="border-2 border-accent/50 bg-gradient-to-br from-background to-accent/5">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-accent" />
            Key Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h5 className="font-heading font-semibold">Flexibility</h5>
              <p className="text-sm text-muted-foreground font-body">
                Create unlimited custom roles tailored to your team structure
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-heading font-semibold">Security</h5>
              <p className="text-sm text-muted-foreground font-body">
                Granular access control ensures users only see what they need
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-heading font-semibold">Scalability</h5>
              <p className="text-sm text-muted-foreground font-body">
                Easy to adapt as your team and operations grow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesDocs;