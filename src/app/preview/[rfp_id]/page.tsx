"use client";

import { useState } from "react";
import { useQuestions } from "@/context/QuestionsContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Eye,
} from "lucide-react";
import ExportOptionsPanel from "@/components/ExportOptionsPanel";
import DocumentPreview from "@/components/DocumentPreview";
import { useExport } from "@/hooks/useExport";

type ViewMode = "document" | "preview";

export default function PreviewPage() {
  const router = useRouter();
  const { sections, getAnswer, getStatus } = useQuestions();
  const [viewMode, setViewMode] = useState<ViewMode>("document");

  // Export hook
  const {
    format,
    setFormat,
    pageSettings,
    setPageSettings,
    isExporting,
    error,
    handleExport,
  } = useExport({
    sections,
    getAnswer,
    getStatus,
    documentTitle: "Enterprise Cloud Solutions RFP",
  });

  // Calculate overall stats
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  const answeredQuestions = sections
    .flatMap((s) => s.questions)
    .filter((q) => getStatus(q.id) === "saved").length;
  const inProgressQuestions = sections
    .flatMap((s) => s.questions)
    .filter((q) => getStatus(q.id) === "editing").length;

  const getDecisionStatus = () => {
    if (answeredQuestions === totalQuestions) {
      return {
        label: "Ready for Review",
        color: "bg-green-100 text-green-700",
      };
    } else if (answeredQuestions > 0) {
      return { label: "In Progress", color: "bg-yellow-100 text-yellow-700" };
    } else {
      return { label: "Not Started", color: "bg-gray-100 text-gray-700" };
    }
  };

  const decisionStatus = getDecisionStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  RFP Preview & Export
                </h1>
                <p className="text-sm text-gray-500">
                  Enterprise Cloud Solutions RFP
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("document")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "document"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText size={16} />
                Document
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "preview"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Eye size={16} />
                Page Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-3 space-y-4">
            {/* Export Options */}
            <ExportOptionsPanel
              format={format}
              pageSettings={pageSettings}
              onFormatChange={setFormat}
              onPageSettingsChange={setPageSettings}
              onExport={handleExport}
              isExporting={isExporting}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Sections Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Sections
              </h3>
              <div className="space-y-2">
                {sections.map((section) => {
                  const answered = section.questions.filter(
                    (q) => getStatus(q.id) === "saved"
                  ).length;
                  const total = section.questions.length;
                  const percentage =
                    total > 0 ? Math.round((answered / total) * 100) : 0;

                  return (
                    <div
                      key={section.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {section.id}. {section.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Document Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-green-600">
                    {answeredQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-semibold text-blue-600">
                    {inProgressQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding:</span>
                  <span className="font-semibold text-gray-600">
                    {totalQuestions - answeredQuestions - inProgressQuestions}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Decision */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Your Review Decision
              </h3>
              <div
                className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${decisionStatus.color}`}
              >
                {decisionStatus.label}
              </div>

              {answeredQuestions === totalQuestions && (
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  Approve Document
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">
            {viewMode === "preview" ? (
              /* Page Preview Mode */
              <DocumentPreview
                sections={sections}
                getAnswer={getAnswer}
                getStatus={getStatus}
                pageSettings={pageSettings}
              />
            ) : (
              /* Document View Mode - NO checkmarks, NO gray background */
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-8 py-6 space-y-8">
                  {sections.map((section) => (
                    <div key={section.id} className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                        <FileText size={20} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Section {section.id}: {section.title}
                        </h2>
                      </div>

                      {section.questions.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">
                          No questions in this section
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {section.questions.map((q) => {
                            const answer = getAnswer(q.id);
                            const hasAnswer =
                              answer &&
                              answer !== "<p></p>" &&
                              answer.trim() !== "";

                            return (
                              <div key={q.id} className="space-y-3">
                                {/* Question - NO checkmark icon */}
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                    {q.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {q.fullQuestion}
                                  </p>

                                  {/* Answer - NO gray background */}
                                  {hasAnswer ? (
                                    <div
                                      className="prose prose-sm max-w-none text-gray-700 pl-4"
                                      dangerouslySetInnerHTML={{
                                        __html: answer,
                                      }}
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-400 italic pl-4">
                                      No answer provided yet
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


















































// "use client";

// import { useState } from "react";
// import { useQuestions } from "@/context/QuestionsContext";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
//   Eye,
//   Settings,
// } from "lucide-react";
// import ExportOptionsPanel from "@/components/ExportOptionsPanel";
// import DocumentPreview from "@/components/DocumentPreview";
// import { useExport } from "@/hooks/useExport";

// type ViewMode = "document" | "preview";

// export default function PreviewPage() {
//   const router = useRouter();
//   const { sections, getAnswer, getStatus } = useQuestions();
//   const [viewMode, setViewMode] = useState<ViewMode>("document");

//   // Export hook
//   const {
//     format,
//     setFormat,
//     pageSettings,
//     setPageSettings,
//     isExporting,
//     error,
//     handleExport,
//   } = useExport({
//     sections,
//     getAnswer,
//     getStatus,
//     documentTitle: "Enterprise Cloud Solutions RFP",
//   });

//   // Calculate overall stats
//   const totalQuestions = sections.reduce(
//     (sum, s) => sum + s.questions.length,
//     0
//   );
//   const answeredQuestions = sections
//     .flatMap((s) => s.questions)
//     .filter((q) => getStatus(q.id) === "saved").length;
//   const inProgressQuestions = sections
//     .flatMap((s) => s.questions)
//     .filter((q) => getStatus(q.id) === "editing").length;

//   const getDecisionStatus = () => {
//     if (answeredQuestions === totalQuestions) {
//       return {
//         label: "Ready for Review",
//         color: "bg-green-100 text-green-700",
//       };
//     } else if (answeredQuestions > 0) {
//       return { label: "In Progress", color: "bg-yellow-100 text-yellow-700" };
//     } else {
//       return { label: "Not Started", color: "bg-gray-100 text-gray-700" };
//     }
//   };

//   const decisionStatus = getDecisionStatus();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => router.back()}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ArrowLeft size={20} className="text-gray-600" />
//               </button>
//               <div>
//                 <h1 className="text-xl font-semibold text-gray-900">
//                   RFP Preview & Export
//                 </h1>
//                 <p className="text-sm text-gray-500">
//                   Enterprise Cloud Solutions RFP
//                 </p>
//               </div>
//             </div>

//             {/* View Mode Toggle */}
//             <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
//               <button
//                 onClick={() => setViewMode("document")}
//                 className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                   viewMode === "document"
//                     ? "bg-white text-gray-900 shadow-sm"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <FileText size={16} />
//                 Document
//               </button>
//               <button
//                 onClick={() => setViewMode("preview")}
//                 className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                   viewMode === "preview"
//                     ? "bg-white text-gray-900 shadow-sm"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <Eye size={16} />
//                 Page Preview
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <aside className="col-span-3 space-y-4">
//             {/* Export Options */}
//             <ExportOptionsPanel
//               format={format}
//               pageSettings={pageSettings}
//               onFormatChange={setFormat}
//               onPageSettingsChange={setPageSettings}
//               onExport={handleExport}
//               isExporting={isExporting}
//             />

//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             {/* Sections Progress */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">
//                 Sections
//               </h3>
//               <div className="space-y-2">
//                 {sections.map((section) => {
//                   const answered = section.questions.filter(
//                     (q) => getStatus(q.id) === "saved"
//                   ).length;
//                   const total = section.questions.length;
//                   const percentage =
//                     total > 0 ? Math.round((answered / total) * 100) : 0;

//                   return (
//                     <div
//                       key={section.id}
//                       className="flex items-center justify-between text-sm"
//                     >
//                       <span className="text-blue-600 hover:underline cursor-pointer">
//                         {section.id}. {section.title}
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-green-500 rounded-full"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                         <span className="text-xs text-gray-500 w-8 text-right">
//                           {percentage}%
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Document Stats */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                 Document Stats
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Total Questions:</span>
//                   <span className="font-semibold">{totalQuestions}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Completed:</span>
//                   <span className="font-semibold text-green-600">
//                     {answeredQuestions}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">In Progress:</span>
//                   <span className="font-semibold text-blue-600">
//                     {inProgressQuestions}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Outstanding:</span>
//                   <span className="font-semibold text-gray-600">
//                     {totalQuestions - answeredQuestions - inProgressQuestions}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Review Decision */}
//             <div className="bg-white rounded-lg border border-gray-200 p-4">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                 Your Review Decision
//               </h3>
//               <div
//                 className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${decisionStatus.color}`}
//               >
//                 {decisionStatus.label}
//               </div>

//               {answeredQuestions === totalQuestions && (
//                 <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
//                   Approve Document
//                 </button>
//               )}
//             </div>
//           </aside>

//           {/* Main Content */}
//           <main className="col-span-9">
//             {viewMode === "preview" ? (
//               /* Page Preview Mode */
//               <DocumentPreview
//                 sections={sections}
//                 getAnswer={getAnswer}
//                 getStatus={getStatus}
//                 pageSettings={pageSettings}
//               />
//             ) : (
//               /* Document View Mode */
//               <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
//                 <div className="px-8 py-6 space-y-8">
//                   {sections.map((section) => (
//                     <div key={section.id} className="space-y-6">
//                       <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
//                         <FileText size={20} className="text-gray-600" />
//                         <h2 className="text-lg font-semibold text-gray-900">
//                           Section {section.id}: {section.title}
//                         </h2>
//                       </div>

//                       {section.questions.length === 0 ? (
//                         <p className="text-sm text-gray-400 italic">
//                           No questions in this section
//                         </p>
//                       ) : (
//                         <div className="space-y-6">
//                           {section.questions.map((q) => {
//                             const answer = getAnswer(q.id);
//                             const status = getStatus(q.id);
//                             const hasAnswer =
//                               answer &&
//                               answer !== "<p></p>" &&
//                               answer.trim() !== "";

//                             return (
//                               <div key={q.id} className="space-y-3">
//                                 <div className="flex items-start gap-3">
//                                   <div className="flex-shrink-0 mt-1">
//                                     {status === "saved" ? (
//                                       <CheckCircle2
//                                         size={18}
//                                         className="text-green-500"
//                                       />
//                                     ) : (
//                                       <AlertCircle
//                                         size={18}
//                                         className="text-gray-300"
//                                       />
//                                     )}
//                                   </div>
//                                   <div className="flex-1 min-w-0">
//                                     <h3 className="text-sm font-semibold text-gray-900 mb-1">
//                                       {q.title}
//                                     </h3>
//                                     <p className="text-sm text-gray-600 mb-3">
//                                       {q.fullQuestion}
//                                     </p>

//                                     {hasAnswer ? (
//                                       <div
//                                         className="prose prose-sm max-w-none text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4"
//                                         dangerouslySetInnerHTML={{
//                                           __html: answer,
//                                         }}
//                                       />
//                                     ) : (
//                                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                                         <p className="text-sm text-gray-400 italic">
//                                           No answer provided yet
//                                         </p>
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }
