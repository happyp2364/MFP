import re

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'r') as f:
    content = f.read()

if "const [provisionError, setProvisionError] = useState<string | null>(null);" not in content:
    content = content.replace("const [provisionResult, setProvisionResult] = useState<any>(null);", "const [provisionResult, setProvisionResult] = useState<any>(null);\n  const [provisionError, setProvisionError] = useState<string | null>(null);")

# Clear error on handleNext
if "const handleNext =" in content:
    content = content.replace("const handleNext = () => {", "const handleNext = () => {\n    setProvisionError(null);")

# Update catch block
catch_block = """    } catch (err: any) {
      console.error('Provisioning Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setProvisionError(msg);
      // alert removed so it shows in UI
    } finally {"""

content = re.sub(r"\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*alert\(.*?\);\n\s*// Also set an error.*?\n\s*\} finally \{", catch_block, content, flags=re.DOTALL)

# Add error display in Step 5 (Final Step before success)
# We will just put it above the Action buttons in step 5
# Look for "Review & Provision" section

error_ui = """
              {provisionError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm whitespace-pre-wrap font-mono">
                  {provisionError}
                </div>
              )}
"""

content = content.replace("              {/* --- ACTION BUTTONS --- */}", error_ui + "\n              {/* --- ACTION BUTTONS --- */}")

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'w') as f:
    f.write(content)

