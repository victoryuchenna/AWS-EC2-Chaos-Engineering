# Loops indefinitely
while ($true) {
# Start TestLimit that fills up all available physical memory and touches it afterwards
# psexec -sid .\testlimit64.exe –d
testlimit64 -d 1024
# Sleep so that the memory gets filled, this needs to be finetuned to each individual machine
# If touching different NUMA node than is closest to pCPU the –s value will need to increase
Start-Sleep -s 11
# After the memory is full, find the TestLimit process ID and kill it
$killPID = (Get-Process | where {$_.name -like "*testlimit*"}).Id
Stop-Process $killPID –Force
# Sleep so that the Windows Kernel cleans up the freed memory so that the TestLimit can start again
# The memory needs to be cleaned completely before another TestLimit can start successfully.
Start-Sleep -s 9
}