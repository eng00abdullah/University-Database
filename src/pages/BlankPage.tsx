export default function BlankPage({ name }: { name: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-ui-bg rounded-2xl flex items-center justify-center mb-6 text-ui-muted">
        <span className="text-3xl font-black">?</span>
      </div>
      <h2 className="text-2xl font-bold text-ui-text mb-2 tracking-tight">{name} Module</h2>
      <p className="text-ui-muted max-w-sm text-sm font-medium leading-relaxed">
        This module is currently being finalized for deployment. 
        Advanced reporting and management tools will be live in the next release.
      </p>
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-8 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all active:scale-[0.98]"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
