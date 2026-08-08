import re

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'r') as f:
    content = f.read()

error_ui = """
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}
"""

content = content.replace("                </div>\n              </div>\n            )}", "                </div>" + error_ui + "\n              </div>\n            )}")

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'w') as f:
    f.write(content)

