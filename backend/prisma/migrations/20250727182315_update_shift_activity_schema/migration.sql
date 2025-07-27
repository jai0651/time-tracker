-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "taskId" TEXT;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
