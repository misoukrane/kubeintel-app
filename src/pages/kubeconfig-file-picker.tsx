import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { homeDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';

export const KubeconfigFilePicker = () => {
  const [selectedFile, setSelectedFile] = useState("");
  const  cfgState = useConfigStore();
  const navigate = useNavigate();

  const openFileDialog = async () => {
    try {
      const homeDirectory = await homeDir();
      const kubePath = await join(homeDirectory, '.kube');
      const selected = await open({
        multiple: false,
        directory: false,
        defaultPath: kubePath,
        filters: [{
          name: 'All Files',
          extensions: ['*.*']
        }]
      });

      if (selected) {
        setSelectedFile(selected);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const onContinue = () => {
    cfgState.addKubeconfig(selectedFile);
    cfgState.setSelectedKubeconfig(selectedFile);
    console.log(cfgState)
    navigate('/cluster');
  }

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Choose your kubeconfig file</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={openFileDialog}
            variant="outline"
            className="w-full p-8 border-dashed border-2 hover:border-primary"
          >
            <FolderOpen className="mr-2 h-6 w-6" />
            Click to select a file
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center">
          {selectedFile && (
            <>
            <div className="text-sm font-bold break-all">
              Selected: {selectedFile}
            </div>
            <Button className='my-2' onClick={onContinue}>Continue <ArrowRight /></Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};