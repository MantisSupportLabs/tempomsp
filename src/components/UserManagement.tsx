import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, UserPlus, Building } from "lucide-react";

interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  company_id?: string;
  company?: Company;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New user form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [companyId, setCompanyId] = useState("");

  // New company form state
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*, company:companies(*)");

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase.from("companies").select("*");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching companies",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the Supabase Edge Function to create a user
      console.log("Creating user with:", {
        email,
        password,
        name,
        role,
        companyId,
      });
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email,
          password,
          userData: {
            name,
            role,
            company_id: companyId || null,
          },
        },
      });
      console.log("Response:", data, error);

      if (error) throw error;

      toast({
        title: "User created",
        description: `Successfully created user ${email}`,
      });

      // Reset form and close dialog
      setEmail("");
      setPassword("");
      setName("");
      setRole("client");
      setCompanyId("");
      setNewUserOpen(false);

      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function createCompany(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Company created",
        description: `Successfully created company ${companyName}`,
      });

      // Reset form and close dialog
      setCompanyName("");
      setCompanyAddress("");
      setCompanyPhone("");
      setCompanyEmail("");
      setNewCompanyOpen(false);

      // Refresh company list
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User & Company Management</h1>
        <div className="flex gap-2">
          <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. They will receive an email with
                  their login credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Select value={companyId} onValueChange={setCompanyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createCompany} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Input
                      id="companyAddress"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Company"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.email}</CardTitle>
                  <CardDescription>
                    Role:{" "}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Company: {user.company?.name || "None"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {users.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="companies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {company.address && <p>Address: {company.address}</p>}
                  {company.phone && <p>Phone: {company.phone}</p>}
                  {company.email && <p>Email: {company.email}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          {companies.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No companies found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
