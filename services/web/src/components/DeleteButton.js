import PropTypes from 'prop-types';
import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import ErrorMessage from './ErrorMessage';

export default function DeleteButton({
  onDelete,
  objectName = 'item',
  text = 'Delete',
  confirmText,
}) {
  const openDeleteModal = () => {
    modals.openConfirmModal({
      title: `Delete ${objectName}`,
      children: (
        <>
          <Text size="sm">
            {confirmText ||
              `Are you sure you want to delete ${objectName}. This action is destructive and you will have to contact support to restore your data`}
          </Text>
        </>
      ),
      labels: { confirm: 'Yes, Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await onDelete();
        } catch (error) {
          modals.open({
            title: 'Error',
            children: <ErrorMessage error={error} />,
          });
        }
      },
    });
  };

  return <Button onClick={openDeleteModal}>{text}</Button>;
}

DeleteButton.propTypes = {
  onDelete: PropTypes.func.isRequired,
  objectName: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
};
