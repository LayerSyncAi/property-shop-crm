export default function SyncMediaStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The studio is a full-screen tool, like any other editor. The app shell
    // wraps its children in a padded column beside the sidebar, which leaves a
    // live canvas roughly a third of the room it needs, so this route takes the
    // viewport instead. Its own Back button replaces the nav.
    //
    // z-50 matches the sidebar rather than beating it, and wins on DOM order:
    // the shell renders the sidebar before {children}. That keeps the command
    // palette at z-[60] above the studio, which is where it belongs.
    <div className="fixed inset-0 z-50 overflow-hidden bg-content-bg">{children}</div>
  );
}
