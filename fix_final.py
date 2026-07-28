import re
with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("""  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_ENABLED);
    return saved === 'true';
  });
  const [lastSaveMetrics, setLastSaveMetrics] = useState<{
    writeTimeMs: number;
    docsUpdated: string[];
    fieldsUpdated: Record<string, string[]>;
  } | null>(null);""", """  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true');
  const [lastSaveMetrics, setLastSaveMetrics] = useState<{
    writeTimeMs: number;
    docsUpdated: string[];
    fieldsUpdated: Record<string, string[]>;
  } | null>(null);""")

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)
