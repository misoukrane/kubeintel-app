import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen } from "lucide-react";

const KubeconfigFilePicker = () => {
  const [selectedFile, setSelectedFile] = useState("");

  const openFileDialog = async () => {
    try {
      const selected = await open({
        multiple: false,
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

  return (
    <div className="flex flex-col h-screen justify-center items-center">
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select a kubeconfig file</CardTitle>
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
      <CardFooter className="flex flex-col items-start">
        {selectedFile && (
          <div className="text-sm text-muted-foreground break-all">
            Selected: {selectedFile}
          </div>
        )}
      </CardFooter>
    </Card>
    </div>
  );
};

export {KubeconfigFilePicker}; 