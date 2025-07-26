-- CreateTable
CREATE TABLE "_TaskEmployees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskEmployees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskEmployees_B_index" ON "_TaskEmployees"("B");

-- AddForeignKey
ALTER TABLE "_TaskEmployees" ADD CONSTRAINT "_TaskEmployees_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskEmployees" ADD CONSTRAINT "_TaskEmployees_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
