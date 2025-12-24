import ChevronLeftIcon from "../Common/Icons/ChevronLeftIcon";

interface HeaderProps {
  title: string;

  hasUnsavedChanges: boolean;
  isSaving?: boolean;
  isExporting?: boolean;

  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
}

const Header = ({
  title,
  hasUnsavedChanges,
  isSaving = false,
  isExporting = false,
  onBack,
  onSave,
  onExport,
}: HeaderProps) => {
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    onBack();
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-gray-900">
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving || isExporting}
          className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700
                     hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>

        <button
          onClick={onExport}
          disabled={isSaving || isExporting}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-white
                     disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "#0CB16D",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0AA563";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0CB16D";
          }}
        >
          {isExporting ? "Exporting…" : "Export"}
        </button>
      </div>
    </header>
  );
};

export default Header;
