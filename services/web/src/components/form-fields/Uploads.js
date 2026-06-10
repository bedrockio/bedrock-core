import { uniq } from 'lodash';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import {
  PiFileArchiveLight,
  PiFileAudioLight,
  PiFileImageLight,
  PiFileLight,
  PiFileTextLight,
  PiFileVideoLight,
  PiTrashSimpleBold,
} from 'react-icons/pi';

import PrivateAudio from 'components/PrivateAudio';
import PrivateImage from 'components/PrivateImage';
import Thumbnail from 'components/Thumbnail';
import { useRequest } from 'hooks/request';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { request } from 'utils/api';
import { urlForUpload } from 'utils/uploads';

const MIME_TYPES = {
  image: {
    mime: 'image/*',
    extensions: ['.jpg', '.jpeg', '.gif', '.svg', '.png'],
  },
  video: {
    mime: 'video/*',
    extensions: ['.mp4', '.mov'],
  },
  audio: {
    mime: 'audio/*',
    extensions: ['.mp3', '.ogg'],
  },
  text: {
    mime: 'text/*',
    extensions: ['.txt'],
  },
  pdf: {
    mime: 'application/pdf',
    extensions: ['.pdf'],
  },
  csv: {
    mime: 'text/csv,application/vnd.ms-excel',
    extensions: ['.csv'],
  },
  zip: {
    mime: 'application/zip,application/x-zip-compressed,application/octet-stream',
    extensions: ['.zip'],
  },
  document: {
    mime: 'application/pdf,image/*,text/*',
    extensions: ['.pdf', '.png', '.jpg', '.jpeg', '.txt'],
  },
};

const MEDIA_TYPES = ['image', 'video', 'audio'];

export default function UploadsField(props) {
  const { name, value, private: isPrivate } = props;

  // Events

  function getUploadUrl() {
    return isPrivate ? '/1/uploads/private' : '/1/uploads';
  }
  const { run: upload, loading } = useRequest({
    async handler(files) {
      const { data } = await request({
        method: 'POST',
        path: getUploadUrl(),
        files,
      });

      if (isMultiple()) {
        props.onChange(name, [...value, ...data]);
      } else {
        props.onChange(name, data[0]);
      }
    },
    onError(error) {
      props.onError?.(error);
    },
  });

  async function onDrop(acceptedFiles, rejectedFiles) {
    if (!isMultiple()) {
      acceptedFiles = acceptedFiles.slice(0, 1);
    }
    if (rejectedFiles.length) {
      const messages = rejectedFiles.flatMap((rejectedFile) => {
        return rejectedFile.errors.map((error) => {
          let { code, message } = error;
          if (code === 'file-invalid-type') {
            const types = getTypes();
            const formatted = new Intl.ListFormat('en', {
              style: 'short',
              type: 'disjunction',
            }).format(types);
            message = `File must be of ${formatted} type.`;
          }
          return message;
        });
      });
      const message = uniq(messages).join(' ');
      throw new Error(message);
    }

    upload(acceptedFiles);
  }

  // Helpers

  function getUploads() {
    if (isMultiple()) {
      return value;
    } else {
      return value ? [value] : [];
    }
  }

  function getUploadId(obj) {
    return obj.id || obj;
  }

  function isMultiple() {
    return Array.isArray(value);
  }

  function remove(upload) {
    if (isMultiple()) {
      const removeId = getUploadId(upload);
      props.onChange({
        name,
        value: value.filter((obj) => {
          return getUploadId(obj) !== removeId;
        }),
      });
    } else {
      props.onChange({
        name,
        value: null,
      });
    }
  }

  function getMediaStyles() {
    return {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
      maxHeight: '100px',
    };
  }

  // Type helpers

  function getTypes() {
    const { types, type = 'document' } = props;
    return types || [type];
  }

  function getTypeForUpload(upload) {
    let type;
    const types = getTypes();
    if (upload.mimeType) {
      const [base, subtype] = upload.mimeType.split('/');
      type = Object.keys(MIME_TYPES).find((key) => {
        return key === base || key === subtype;
      });
    }
    if (!type && types.length === 1) {
      type = types[0];
    }
    if (!type) {
      throw new Error(`Could not determine file type for ${upload}.`);
    }
    return type;
  }

  function getMimeTypes() {
    const allowedTypes = {};
    for (let type of getTypes()) {
      const { mime, extensions } = MIME_TYPES[type];
      for (let inner of mime.split(',')) {
        allowedTypes[inner] = extensions;
      }
    }
    return allowedTypes;
  }

  function isMedia() {
    const types = getTypes();
    return types.every((type) => {
      return MEDIA_TYPES.includes(type);
    });
  }

  function render() {
    const { required, label } = props;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        {renderUploads()}
        <Dropzone
          accept={getMimeTypes()}
          maxSize={5 * 1024 * 1024}
          onDrop={onDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            return (
              <div
                {...getRootProps()}
                className={cn(
                  'border-input cursor-pointer rounded-md border bg-black/[0.02] p-4',
                  isDragActive && 'bg-primary/5',
                )}>
                <input {...getInputProps()} />
                {renderMessage(isDragActive)}
              </div>
            );
          }}
        </Dropzone>
      </div>
    );
  }

  function renderUploads() {
    const uploads = getUploads();

    if (!uploads.length) {
      return;
    }

    if (isMedia()) {
      return renderUploadMedia(uploads);
    } else {
      return renderUploadFilenames(uploads);
    }
  }

  function renderUploadMedia(uploads) {
    return (
      <div className="mb-[0.4em] flex flex-wrap items-center gap-2">
        {uploads.map((upload) => (
          <div
            key={getUploadId(upload)}
            className="border-input relative overflow-hidden rounded-md border">
            {renderUpload(upload)}
            <PiTrashSimpleBold
              style={{
                position: 'absolute',
                inset: '5px 5px auto auto',
                cursor: 'pointer',
                boxSizing: 'content-box',
                padding: '3px',
                background: '#fff',
                borderRadius: '50%',
              }}
              size="14"
              onClick={() => remove(upload)}
            />
            {upload.filename && (
              <span
                className="text-xs"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  color: '#fff',
                  padding: '4px 8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  overflow: 'ellipsis',
                }}>
                {upload.filename}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderUploadFilenames(uploads) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {uploads.map((upload) => (
          <Badge
            key={getUploadId(upload)}
            variant="secondary"
            className="gap-1">
            {upload.filename || 'File'}
            <PiTrashSimpleBold
              style={{ cursor: 'pointer' }}
              onClick={(evt) => remove(evt, upload)}
            />
          </Badge>
        ))}
      </div>
    );
  }

  function renderMessage(isDragActive) {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Spinner />
          Uploading...
        </div>
      );
    } else if (isDragActive) {
      return 'Drop files here...';
    } else {
      const text = isMultiple()
        ? 'Try dropping some files here, or select files to upload.'
        : 'Try dropping a file here, or select a file to upload.';
      return (
        <div className="flex items-center gap-2">
          <span className="text-[28px] leading-none">
            {renderIconForType()}
          </span>
          {text}
        </div>
      );
    }
  }

  function renderUpload(upload) {
    const src = urlForUpload(upload);
    const type = getTypeForUpload(upload);
    if (type === 'image') {
      if (isPrivate) {
        return <PrivateImage upload={upload} style={getMediaStyles()} />;
      } else {
        return <Thumbnail src={src} className="h-full max-h-[100px] w-full" />;
      }
    } else if (type === 'video') {
      return <video src={src} style={getMediaStyles()} controls />;
    } else if (type === 'audio') {
      if (isPrivate) {
        return <PrivateAudio upload={upload} controls />;
      } else {
        return <audio src={src} controls />;
      }
    }
  }

  function renderIconForType(type) {
    type ||= getTypes()[0];
    if (type === 'zip') {
      return <PiFileArchiveLight />;
    } else if (type === 'image') {
      return <PiFileImageLight />;
    } else if (type === 'audio') {
      return <PiFileAudioLight />;
    } else if (type === 'video') {
      return <PiFileVideoLight />;
    } else if (type === 'text') {
      return <PiFileTextLight />;
    } else {
      return <PiFileLight />;
    }
  }

  return render();
}

UploadsField.propTypes = {
  type: PropTypes.oneOf(Object.keys(MIME_TYPES)),
  types: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(MIME_TYPES))),
  private: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};
