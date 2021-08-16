        $NumberOfLogicalProcessors = Get-WmiObject win32_processor | Select-Object -ExpandProperty NumberOfLogicalProcessors
        ForEach ($core in 1..$NumberOfLogicalProcessors){
          Start-Job -Name "ChaosCpu$core" -ScriptBlock {
            $result = 1;
            ForEach ($loopnumber in 1..2147483647){
              $result=1;
              ForEach ($loopnumber1 in 1..2147483647){
                $result=1;
                ForEach($number in 1..2147483647){
                  $result = $result * $number
                } 
              }
            }
          } | Out-Null
          Write-Host "Started Job ChaosCpu$core"
        }
        Write-Host "About to sleep for 60 seconds"
        $totalduration = 300
        Start-Sleep -s ($totalduration/2)
        Get-WmiObject Win32_Processor | Select LoadPercentage | Format-List
        Start-Sleep -s ($totalduration/2)
        Get-WmiObject Win32_Processor | Select LoadPercentage | Format-List
        
        Write-Host "About to stop jobs"
        $cpuJobs = Get-Job -Name "ChaosCpu*"
        ForEach ($job in $cpuJobs) {
          Stop-Job -Name $job.Name | Out-Null
          Write-Host "Stopped $($job.Name)"
          Remove-Job -Name $job.Name | Out-Null
          Write-Host "Removed $($job.Name)"
        }