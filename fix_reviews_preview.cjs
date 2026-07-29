const fs = require('fs');
let content = fs.readFileSync('src/components/Reviews/ReviewsSection.tsx', 'utf-8');

// Add preview state
content = content.replace(
  /const \[newAvatar, setNewAvatar\] = useState\(''\);/,
  `const [newAvatar, setNewAvatar] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [instaError, setInstaError] = useState('');`
);

content = content.replace(
  /const handleAddReview = \(e: React\.FormEvent\) => {/,
  `const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    setInstaError('');

    if (newInstagram && !/^@[a-zA-Z0-9_.]+$/.test(newInstagram)) {
      setInstaError('Instagram username must start with @ and contain only letters, numbers, underscores, or periods.');
      return;
    }

    if (!showPreview) {
      setShowPreview(true);
      return;
    }
`
);

content = content.replace(
  /setNewInstagram\(''\);\n\s*setNewAvatar\(''\);\n\s*\}, 1800\);/,
  `setNewInstagram('');
      setNewAvatar('');
      setShowPreview(false);
    }, 1800);`
);

// We need to inject the preview UI before the submit button if showPreview is true.
// And change submit button text.
// Oh wait, if !showPreview we just set showPreview(true) and return. 
// So the button needs to say "Preview Review" or "Submit Review".
// Let's replace the form.

const submitButtonRegex = /<button\n\s*type="submit"\n\s*className="w-full bg-\[#0B8F63\] hover:bg-\[#086F4C\] text-white font-bold py-3\.5 rounded-xl shadow-md text-sm transition-colors"\n\s*>\n\s*Submit Review\n\s*<\/button>/;

const newSubmit = `{instaError && (
                  <p className="text-red-500 text-xs mt-1">{instaError}</p>
                )}
                {showPreview && (
                  <div className="bg-[#F7F7F7] p-4 rounded-xl border border-neutral-200 mt-4">
                    <h4 className="text-xs font-bold text-neutral-500 mb-2 uppercase">Preview</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={\`w-4 h-4 \${
                              i < newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300'
                            }\`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 font-medium italic">
                        "{newComment}"
                      </p>
                      <div className="pt-2 border-t border-neutral-200 flex items-center gap-3">
                        <img
                          src={newAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={newAuthor}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            {newAuthor}
                            {newInstagram && (
                              <span className="text-pink-600 font-medium text-[9px] bg-pink-50 px-1 rounded-full">
                                {newInstagram}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-500">{newLocation || 'Verified Customer'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {showPreview && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold py-3.5 rounded-xl shadow-sm text-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-colors"
                  >
                    {showPreview ? 'Confirm & Submit' : 'Preview Review'}
                  </button>
                </div>`;

content = content.replace(submitButtonRegex, newSubmit);

fs.writeFileSync('src/components/Reviews/ReviewsSection.tsx', content, 'utf-8');
console.log('Fixed Reviews Preview');
