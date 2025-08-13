import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Search, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Copy,
  ExternalLink,
  Coins,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BlockchainTracking = () => {
  const { toast } = useToast();
  const [searchTxn, setSearchTxn] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const transactions = [
    {
      id: "0x1a2b3c4d5e6f7890",
      date: "2024-01-10",
      time: "14:30",
      type: "Sale Payment",
      crop: "गेहूं (Wheat)",
      quantity: "50 क्विंटल",
      amount: "₹1,22,500",
      buyer: "ABC Traders",
      mandi: "कानपुर मंडी",
      status: "completed",
      confirmations: 12,
      gasUsed: "0.0021 ETH",
      blockNumber: "18,456,789"
    },
    {
      id: "0x2b3c4d5e6f7890ab",
      date: "2024-01-08",
      time: "11:15",
      type: "Advance Payment",
      crop: "चावल (Rice)",
      quantity: "30 क्विंटल",
      amount: "₹15,000",
      buyer: "XYZ Mills",
      mandi: "लखनऊ मंडी",
      status: "pending",
      confirmations: 3,
      gasUsed: "0.0018 ETH",
      blockNumber: "18,456,456"
    },
    {
      id: "0x3c4d5e6f7890abcd",
      date: "2024-01-05",
      time: "16:45",
      type: "Final Settlement",
      crop: "सरसों (Mustard)",
      quantity: "25 क्विंटल",
      amount: "₹87,500",
      buyer: "PQR Exports",
      mandi: "आगरा मंडी",
      status: "completed",
      confirmations: 24,
      gasUsed: "0.0025 ETH",
      blockNumber: "18,455,123"
    }
  ];

  const summary = {
    totalTransactions: 156,
    totalValue: "₹45,67,890",
    pendingPayments: "₹1,25,000",
    completedThisMonth: 23,
    averageSettlementTime: "2.5 hours"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction ID copied to clipboard",
    });
  };

  const searchTransaction = () => {
    const found = transactions.find(t => t.id.includes(searchTxn.toLowerCase()));
    if (found) {
      setSelectedTransaction(found);
      toast({
        title: "Transaction Found!",
        description: `Found transaction for ${found.crop}`,
      });
    } else {
      toast({
        title: "Not Found",
        description: "Please check the transaction ID",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Blockchain Payment Tracking
              </h1>
              <p className="text-muted-foreground">Transparent and secure mandi payment records</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-xl font-bold">{summary.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">{summary.totalValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{summary.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-info" />
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xl font-bold">{summary.completedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Settlement</p>
                  <p className="text-xl font-bold">{summary.averageSettlementTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Transactions List */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter transaction ID (0x...)"
                    value={searchTxn}
                    onChange={(e) => setSearchTxn(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={searchTransaction}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              
              {transactions.map((txn) => (
                <Card key={txn.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(txn.status)}
                          <h3 className="font-semibold">{txn.type}</h3>
                          <Badge className={getStatusColor(txn.status)}>
                            {txn.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Crop & Quantity</p>
                            <p className="font-medium">{txn.crop} - {txn.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-bold text-lg text-success">{txn.amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Buyer</p>
                            <p className="font-medium">{txn.buyer}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mandi</p>
                            <p className="font-medium">{txn.mandi}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTransaction(txn)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{txn.date} at {txn.time}</span>
                        <span>Block #{txn.blockNumber}</span>
                        <Badge variant="outline">
                          {txn.confirmations} confirmations
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(txn.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy ID
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Transaction Details Sidebar */}
          <div>
            {selectedTransaction ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Transaction ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
                        {selectedTransaction.id}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedTransaction.id)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedTransaction.status)}
                        <span className="capitalize">{selectedTransaction.status}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Confirmations</Label>
                      <p className="font-medium">{selectedTransaction.confirmations}/12</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Payment Details</Label>
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-bold">{selectedTransaction.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Used:</span>
                        <span>{selectedTransaction.gasUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Block:</span>
                        <span>#{selectedTransaction.blockNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Crop Information</Label>
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Crop:</span>
                        <span>{selectedTransaction.crop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{selectedTransaction.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mandi:</span>
                        <span>{selectedTransaction.mandi}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Blockchain Explorer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Transparent Records</p>
                        <p className="text-muted-foreground">All payments recorded on blockchain</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Immutable Data</p>
                        <p className="text-muted-foreground">Cannot be tampered or modified</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Real-time Tracking</p>
                        <p className="text-muted-foreground">Live status updates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">Trust Building</p>
                        <p className="text-muted-foreground">Builds confidence between parties</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

export default BlockchainTracking;