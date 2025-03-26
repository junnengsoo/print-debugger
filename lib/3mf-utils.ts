import JSZip from 'jszip';

interface SlicingParameters {
  [key: string]: string | number | boolean | object;
}

/**
 * Extracts the project_settings.config file from a 3MF file
 * and parses the slicing parameters from it
 */
export async function extractSlicingParameters(file: File): Promise<SlicingParameters | null> {
  try {
    // Load the 3MF file as a zip
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Look for the project_settings.config file in the Metadata directory
    const configFile = zipContent.file('Metadata/project_settings.config');

    if (!configFile) {
      console.error('Could not find project_settings.config file in the 3MF file');
      return null;
    }

    // Extract the content of the config file
    const configContent = await configFile.async('string');

    // Parse the config file content
    // Note: The actual format might vary depending on the slicer software
    // This is a simple implementation that should be adjusted based on the actual format
    try {
      // Try to parse as JSON first
      return JSON.parse(configContent);
    } catch (e) {
      // If it's not JSON, try to parse it as a custom format
      return parseConfigFile(configContent);
    }
  } catch (error) {
    console.error('Error extracting slicing parameters:', error);
    return null;
  }
}

/**
 * Parse a non-JSON config file format
 * This implementation should be adjusted based on the actual format of the config file
 */
function parseConfigFile(content: string): SlicingParameters {
  const params: SlicingParameters = {};

  // Split the content into lines
  const lines = content.split('\n');

  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
      continue;
    }

    // Try to extract key-value pairs
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      // Try to convert the value to the appropriate type
      if (trimmedValue === 'true' || trimmedValue === 'false') {
        params[trimmedKey] = trimmedValue === 'true';
      } else if (!isNaN(Number(trimmedValue))) {
        params[trimmedKey] = Number(trimmedValue);
      } else {
        params[trimmedKey] = trimmedValue;
      }
    }
  }

  return params;
}

/**
 * Formats the slicing parameters for display or use in prompts
 */
export function formatSlicingParameters(params: SlicingParameters): string {
  if (!params) return 'No slicing parameters found';

  return Object.entries(params)
    .map(([key, value]) => {
      // Format nested objects
      if (typeof value === 'object' && value !== null) {
        return `${key}:\n${Object.entries(value)
          .map(([subKey, subValue]) => `  ${subKey}: ${subValue}`)
          .join('\n')}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
}