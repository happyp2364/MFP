#!/bin/bash
sed -i -e '/} from '"'"'lucide-react'"'"';/i \
  PauseCircle,\
  Archive,\
  UserCheck,\
  Users2,\
  ShoppingCart,\
  TrendingUp,\
  UserPlus,\
  Key,\
  Server,\
  PlusCircle,\
  FileText,\
  ShieldAlert,\
  Laptop,\
  Smartphone,\
  Clock' src/components/Admin/SuperAdminConsoleView.tsx
