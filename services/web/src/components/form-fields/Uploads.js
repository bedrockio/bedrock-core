import { Badge, Group, Image, Input, Loader, Paper, Text } from '@mantine/core';
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

import PrivateImage from 'components/PrivateImage';
import { useRequest } from 'hooks/request';

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
      <Input.Wrapper label={label} required={required}>
        {renderUploads()}
        <Dropzone
          accept={getMimeTypes()}
          maxSize={5 * 1024 * 1024}
          onDrop={onDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            const background = isDragActive
              ? 'rgb(248 229 52 / 9%)'
              : 'rgb(0 0 0 / 2%)';
            return (
              <Paper
                {...getRootProps()}
                p="md"
                mt="md"
                withBorder
                style={{
                  background,
                  borderColor: 'rgb(0 0 0 / 15%)',
                  cursor: 'pointer',
                }}>
                <input {...getInputProps()} />
                {renderMessage(isDragActive)}
              </Paper>
            );
          }}
        </Dropzone>
      </Input.Wrapper>
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
      <Group mt="md" gap="xs">
        {uploads.map((upload) => (
          <Paper
            withBorder
            key={getUploadId(upload)}
            style={{ position: 'relative' }}>
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
              <Text
                size="xs"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  color: '#fff',
                  padding: '4px 8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  overflow: 'ellipsis',
                }}>
                {upload.filename}
              </Text>
            )}
          </Paper>
        ))}
      </Group>
    );
  }

  function renderUploadFilenames(uploads) {
    return (
      <Group mt="md" gap="xs">
        {uploads.map((upload) => (
          <Badge
            key={getUploadId(upload)}
            variant="default"
            rightSection={
              <PiTrashSimpleBold
                style={{ cursor: 'pointer' }}
                onClick={(evt) => remove(evt, upload)}
              />
            }>
            {upload.filename || 'File'}
          </Badge>
        ))}
      </Group>
    );
  }

  function renderMessage(isDragActive) {
    if (loading) {
      return (
        <Group gap="xs">
          <Loader />
          Uploading...
        </Group>
      );
    } else if (isDragActive) {
      return 'Drop files here...';
    } else {
      const text = isMultiple()
        ? 'Try dropping some files here, or select files to upload.'
        : 'Try dropping a file here, or select a file to upload.';
      return (
        <Group gap="xs">
          <Text size="28px" lh="1">
            {renderIconForType()}
          </Text>
          {text}
        </Group>
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
        return <Image src={src} style={getMediaStyles()} />;
      }
    } else if (type === 'video') {
      return <video src={src} style={getMediaStyles()} controls />;
    } else if (type === 'audio') {
      return <audio src={src} controls />;
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
